"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductTypeById = exports.updateProductTypeById = exports.getProductTypeById = exports.createProductType = exports.getAllProductTypes = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all product types
const getAllProductTypes = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM product_types");
    return rows;
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
    await databaseConnection_1.db
        .promise()
        .query("UPDATE product_types SET Name = ?, Weightage = ?, Active = ? WHERE id = ?", [name, weightage, active, id]);
};
exports.updateProductTypeById = updateProductTypeById;
// Delete product type by ID
const deleteProductTypeById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM product_types WHERE id = ?", [id]);
};
exports.deleteProductTypeById = deleteProductTypeById;
