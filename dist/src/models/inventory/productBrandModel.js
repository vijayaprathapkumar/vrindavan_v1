"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandById = exports.deleteBrandById = exports.updateBrandById = exports.createBrand = exports.getBrandsCount = exports.getAllBrands = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllBrands = async (searchTerm, limit = 10, offset = 0) => {
    let query = "SELECT * FROM product_brands WHERE 1=1"; // Use a base condition
    const queryParams = [];
    if (searchTerm) {
        const isActive = searchTerm === 'true' ? 1 : searchTerm === 'false' ? 0 : null;
        if (isActive !== null) {
            query += " AND active = ?";
            queryParams.push(isActive);
        }
        else {
            query += " AND name LIKE ?";
            queryParams.push(`%${searchTerm}%`);
        }
    }
    query += " LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);
    const [rows] = await databaseConnection_1.db.promise().query(query, queryParams);
    return rows;
};
exports.getAllBrands = getAllBrands;
const getBrandsCount = async (searchTerm) => {
    let query = "SELECT COUNT(*) AS count FROM product_brands";
    const queryParams = [];
    if (searchTerm) {
        query += " WHERE name LIKE ? OR active = ?";
        queryParams.push(`%${searchTerm}%`, searchTerm === 'true' ? 1 : 0);
    }
    const [rows] = await databaseConnection_1.db.promise().query(query, queryParams);
    return rows[0]?.count ?? 0; // Use optional chaining and a default value
};
exports.getBrandsCount = getBrandsCount;
// Create a new product brand
const createBrand = async (name, active = true) => {
    await databaseConnection_1.db.promise().query("INSERT INTO product_brands (name, active) VALUES (?, ?)", [name, active]);
};
exports.createBrand = createBrand;
// Update product brand by ID
const updateBrandById = async (id, name, active) => {
    await databaseConnection_1.db.promise().query("UPDATE product_brands SET name = ?, active = ? WHERE id = ?", [name, active, id]);
};
exports.updateBrandById = updateBrandById;
// Delete product brand by ID
const deleteBrandById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM product_brands WHERE id = ?", [id]);
};
exports.deleteBrandById = deleteBrandById;
// Fetch product brand by ID
const getBrandById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM product_brands WHERE id = ?", [id]);
    return rows;
};
exports.getBrandById = getBrandById;
