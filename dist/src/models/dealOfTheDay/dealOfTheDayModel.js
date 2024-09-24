"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDealById = exports.updateDeal = exports.getDealById = exports.createDeal = exports.getAllDeals = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all deals
const getAllDeals = async (page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    let query = `
    SELECT 
      d.id,
      d.food_id,
      f.name AS food_name,
      d.unit,
      d.price,
      d.offer_price,
      d.quantity,
      d.description,
      d.status,
      d.weightage,
      d.created_at,
      d.updated_at
    FROM 
      deal_of_the_days d
    JOIN 
      foods f ON d.food_id = f.id
    WHERE 
      d.id IS NOT NULL
  `;
    const params = [];
    if (searchTerm) {
        query += ` AND f.name LIKE ?`;
        params.push(`%${searchTerm}%`);
    }
    query += ` LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, params);
    const totalCountQuery = `
    SELECT COUNT(*) AS total 
    FROM deal_of_the_days d
    JOIN foods f ON d.food_id = f.id
    ${searchTerm ? "WHERE f.name LIKE ?" : ""}
  `;
    const countParams = [];
    if (searchTerm)
        countParams.push(`%${searchTerm}%`);
    const [totalCountRows] = await databaseConnection_1.db
        .promise()
        .query(totalCountQuery, countParams);
    const totalCount = totalCountRows[0]?.total || 0;
    return {
        deals: rows.map((row) => ({
            id: row.id,
            food_id: row.food_id,
            food_name: row.food_name,
            unit: row.unit,
            price: row.price,
            offer_price: row.offer_price,
            quantity: row.quantity,
            description: row.description,
            status: row.status,
            weightage: row.weightage,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })),
        total: totalCount,
    };
};
exports.getAllDeals = getAllDeals;
// Create a new deal
const createDeal = async (dealData) => {
    const { foodId, unit, price, offerPrice, quantity, description, status, weightage, } = dealData;
    // Check for required fields
    if (!foodId || !price || !offerPrice || !quantity) {
        throw new Error("Missing required fields: foodId, price, offerPrice, or quantity.");
    }
    const sql = `
    INSERT INTO deal_of_the_days 
    (food_id, unit, price, offer_price, quantity, description, status, weightage, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const values = [
        foodId,
        unit,
        price,
        offerPrice,
        quantity,
        description,
        status,
        weightage,
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result;
    }
    catch (error) {
        throw new Error("Failed to create deal.");
    }
};
exports.createDeal = createDeal;
// Fetch a deal by ID
const getDealById = async (id) => {
    const query = `
    SELECT 
      id,
      food_id,
      unit,
      price,
      offer_price,
      quantity,
      description,
      status,
      weightage,
      created_at,
      updated_at
    FROM 
      deal_of_the_days
    WHERE 
      id = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    if (rows.length === 0)
        return null;
    return {
        id: rows[0].id,
        food_id: rows[0].food_id,
        unit: rows[0].unit,
        price: rows[0].price,
        offer_price: rows[0].offer_price,
        quantity: rows[0].quantity,
        description: rows[0].description,
        status: rows[0].status,
        weightage: rows[0].weightage,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
    };
};
exports.getDealById = getDealById;
// Update a deal
const updateDeal = async (id, dealData) => {
    const { foodId, unit, price, offerPrice, quantity, description, status, weightage, } = dealData;
    const sql = `
      UPDATE deal_of_the_days 
      SET 
        food_id = COALESCE(?, food_id),
        unit = COALESCE(?, unit),
        price = COALESCE(?, price),
        offer_price = COALESCE(?, offer_price),
        quantity = COALESCE(?, quantity),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        weightage = COALESCE(?, weightage),
        updated_at = NOW()
      WHERE 
        id = ?;
    `;
    const values = [
        foodId,
        unit,
        price,
        offerPrice,
        quantity,
        description,
        status,
        weightage,
        id,
    ];
    await databaseConnection_1.db.promise().query(sql, values);
};
exports.updateDeal = updateDeal;
// Delete a deal by ID
const deleteDealById = async (id) => {
    const sql = `
    DELETE FROM deal_of_the_days 
    WHERE id = ?;
  `;
    await databaseConnection_1.db.promise().query(sql, [id]);
};
exports.deleteDealById = deleteDealById;
