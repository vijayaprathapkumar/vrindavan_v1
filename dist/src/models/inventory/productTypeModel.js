"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductTypeById = exports.updateProductTypeById = exports.getProductTypeById = exports.createProductType = exports.getAllProductTypes = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllProductTypes = async (searchTerm, limit, offset, sortField, sortOrder) => {
    const countQuery = `
    SELECT COUNT(*) as total FROM product_types
    WHERE Name LIKE ? OR Weightage LIKE ? OR Active LIKE ?
  `;
    let activeValue = null;
    if (searchTerm.toLowerCase() === "active") {
        activeValue = 1;
    }
    else if (searchTerm.toLowerCase() === "inactive") {
        activeValue = 0;
    }
    const validSortFields = {
        name: "product_types.name",
        weightage: "CAST(product_types.weightage AS UNSIGNED)",
        active: "product_types.active",
    };
    const orderBy = validSortFields[sortField] || validSortFields["name"];
    const validSortOrders = ["ASC", "DESC"];
    const orderDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : "ASC";
    const [countResult] = await databaseConnection_1.db
        .promise()
        .query(countQuery, [
        `%${searchTerm}%`,
        `${searchTerm}`,
        activeValue,
    ]);
    const total = countResult[0].total;
    // Fetch the actual records
    const query = `
    SELECT * FROM product_types
    WHERE Name LIKE ? OR Weightage LIKE ? OR Active LIKE ?
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT ? OFFSET ?
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, [
        `%${searchTerm}%`,
        `${searchTerm}`,
        activeValue,
        limit,
        offset,
    ]);
    return { total, rows };
};
exports.getAllProductTypes = getAllProductTypes;
// Create a new product type
const createProductType = async (name, weightage, active) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO product_types (Name, Weightage, Active) VALUES (?, ?, ?)", [name, weightage, active]);
};
exports.createProductType = createProductType;
// Fetch product type by ID
const getProductTypeById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM product_types WHERE id = ?", [id]);
    return rows;
};
exports.getProductTypeById = getProductTypeById;
// Update product type by ID
const updateProductTypeById = async (id, name, weightage, active) => {
    const [result] = await databaseConnection_1.db
        .promise()
        .query("UPDATE product_types SET Name = ?, Weightage = ?, Active = ? WHERE id = ?", [name, weightage, active, id]);
    return result;
};
exports.updateProductTypeById = updateProductTypeById;
// Delete product type by ID
const deleteProductTypeById = async (id) => {
    const [result] = await databaseConnection_1.db
        .promise()
        .query("DELETE FROM product_types WHERE id = ?", [id]);
    return result;
};
exports.deleteProductTypeById = deleteProductTypeById;
