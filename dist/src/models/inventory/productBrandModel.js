"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandById = exports.deleteBrandById = exports.updateBrandById = exports.createBrand = exports.getAllBrands = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all product brands
const getAllBrands = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM product_brands");
    return rows;
};
exports.getAllBrands = getAllBrands;
// Create a new product brand (with optional 'active' status)
const createBrand = async (name, active) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO product_brands (name, active) VALUES (?, ?)", [name, active]);
};
exports.createBrand = createBrand;
// Update product brand by ID (with optional 'active' status)
const updateBrandById = async (id, name, active) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE product_brands SET name = ?, active = ? WHERE id = ?", [name, active, id]);
};
exports.updateBrandById = updateBrandById;
// Delete product brand by ID
const deleteBrandById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM product_brands WHERE id = ?", [id]);
};
exports.deleteBrandById = deleteBrandById;
// Fetch product brand by ID
const getBrandById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM product_brands WHERE id = ?", [id]);
    return rows;
};
exports.getBrandById = getBrandById;
