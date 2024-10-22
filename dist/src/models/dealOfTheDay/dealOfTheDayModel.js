"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDealById = exports.updateDeals = exports.getDealById = exports.createDeal = exports.getAllDeals = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all deals
const getAllDeals = async (page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    let query = `
    SELECT 
      d.id AS deal_id,
      d.food_id,
      f.name AS food_name,
      d.unit,
      d.price,
      d.offer_price,
      d.quantity,
      d.description,
      d.status,
      d.weightage,
      d.created_at AS deal_created_at,
      d.updated_at AS deal_updated_at,
      m.id AS media_id,
      m.model_type,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size AS media_size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      deal_of_the_days d
    JOIN 
      foods f ON d.food_id = f.id 
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      d.id IS NOT NULL
  `;
    const params = [];
    if (searchTerm) {
        query += ` AND f.name LIKE ?`;
        params.push(`%${searchTerm}%`);
    }
    // Ensure the ORDER BY clause is specifying DESC
    query += ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, params);
    const totalCountQuery = `
    SELECT COUNT(*) AS total 
    FROM deal_of_the_days d
    JOIN foods f ON d.food_id = f.id
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'Food'
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
            id: row.deal_id,
            food_id: row.food_id,
            food_name: row.food_name,
            unit: row.unit,
            price: row.price,
            offer_price: row.offer_price,
            quantity: row.quantity,
            description: row.description,
            status: row.status,
            weightage: row.weightage,
            created_at: row.deal_created_at,
            updated_at: row.deal_updated_at,
            media: {
                id: row.media_id,
                model_type: row.model_type,
                uuid: row.uuid,
                collection_name: row.collection_name,
                name: row.media_name,
                file_name: row.file_name,
                mime_type: row.mime_type,
                disk: row.disk,
                conversions_disk: row.conversions_disk,
                size: row.media_size,
                manipulations: row.manipulations,
                custom_properties: row.custom_properties,
                generated_conversions: row.generated_conversions,
                responsive_images: row.responsive_images,
                order_column: row.order_column,
                created_at: row.media_created_at,
                updated_at: row.media_updated_at,
                original_url: row.original_url,
            },
        })),
        total: totalCount,
    };
};
exports.getAllDeals = getAllDeals;
// Create a new deal
const createDeal = async (dealData) => {
    const { food_id, unit, price, offer_price, quantity, description, status, weightage, } = dealData;
    if (!food_id || !price || !offer_price || !quantity) {
        throw new Error("Missing required fields: foodId, price, offerPrice, or quantity.");
    }
    const sql = `
    INSERT INTO deal_of_the_days 
    (food_id, unit, price, offer_price, quantity, description, status, weightage, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const values = [
        food_id,
        unit,
        price,
        offer_price,
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
      d.id AS deal_id,
      d.food_id,
      f.name AS food_name,  -- Add the food name if needed
      d.unit,
      d.price,
      d.offer_price,
      d.quantity,
      d.description,
      d.status,
      d.weightage,
      d.created_at AS deal_created_at,
      d.updated_at AS deal_updated_at,
      m.id AS media_id,
      m.model_type,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size AS media_size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      deal_of_the_days d
    JOIN 
      foods f ON d.food_id = f.id  -- Joining foods table to get food details
    LEFT JOIN 
      media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      d.id = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    if (rows.length === 0)
        return null;
    return {
        id: rows[0].deal_id,
        food_id: rows[0].food_id,
        food_name: rows[0].food_name, // Include food_name in the return value
        unit: rows[0].unit,
        price: rows[0].price,
        offer_price: rows[0].offer_price,
        quantity: rows[0].quantity,
        description: rows[0].description,
        status: rows[0].status,
        weightage: rows[0].weightage,
        created_at: rows[0].deal_created_at,
        updated_at: rows[0].deal_updated_at,
        media: {
            id: rows[0].media_id,
            model_type: rows[0].model_type,
            uuid: rows[0].uuid,
            collection_name: rows[0].collection_name,
            name: rows[0].media_name,
            file_name: rows[0].file_name,
            mime_type: rows[0].mime_type,
            disk: rows[0].disk,
            conversions_disk: rows[0].conversions_disk,
            size: rows[0].media_size,
            manipulations: rows[0].manipulations,
            custom_properties: rows[0].custom_properties,
            generated_conversions: rows[0].generated_conversions,
            responsive_images: rows[0].responsive_images,
            order_column: rows[0].order_column,
            created_at: rows[0].media_created_at,
            updated_at: rows[0].media_updated_at,
            original_url: rows[0].original_url,
        },
    };
};
exports.getDealById = getDealById;
// Update a deal
const updateDeals = async (id, dealData) => {
    const { foodId, unit, price, offerPrice, quantity, description, status, weightage, } = dealData;
    let sql = "UPDATE deal_of_the_days SET ";
    const updates = [];
    const params = [];
    if (foodId) {
        updates.push("food_id = COALESCE(?, food_id)");
        params.push(foodId);
    }
    if (unit) {
        updates.push("unit = COALESCE(?, unit)");
        params.push(unit);
    }
    if (price !== undefined) {
        updates.push("price = COALESCE(?, price)");
        params.push(price);
    }
    if (offerPrice !== undefined) {
        updates.push("offer_price = COALESCE(?, offer_price)");
        params.push(offerPrice);
    }
    if (quantity !== undefined) {
        updates.push("quantity = COALESCE(?, quantity)");
        params.push(quantity);
    }
    if (description) {
        updates.push("description = COALESCE(?, description)");
        params.push(description);
    }
    if (status !== undefined) {
        updates.push("status = COALESCE(?, status)");
        params.push(status);
    }
    if (weightage !== undefined) {
        updates.push("weightage = COALESCE(?, weightage)");
        params.push(weightage);
    }
    sql += updates.join(", ") + " WHERE id = ?;";
    params.push(id);
    const [result] = await databaseConnection_1.db.promise().query(sql, params);
    return result;
};
exports.updateDeals = updateDeals;
// Delete a deal
const deleteDealById = async (id) => {
    const sql = "DELETE FROM deal_of_the_days WHERE id = ?;";
    const [result] = await databaseConnection_1.db.promise().query(sql, [id]);
    return result;
};
exports.deleteDealById = deleteDealById;
