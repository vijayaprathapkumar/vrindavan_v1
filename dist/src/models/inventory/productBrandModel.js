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
// Create a new product brand
const createBrand = async (name) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO product_brands (Name, Active) VALUES (?, TRUE)", [name]);
};
exports.createBrand = createBrand;
// Update product brand by ID
const updateBrandById = async (id, name) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE product_brands SET Name = ? WHERE BrandID = ?", [name, id]);
};
exports.updateBrandById = updateBrandById;
// Delete product brand by ID
const deleteBrandById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM product_brands WHERE BrandID = ?", [id]);
};
exports.deleteBrandById = deleteBrandById;
// Fetch product brand by ID
const getBrandById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM product_brands WHERE BrandID = ?", [id]);
    return rows;
};
exports.getBrandById = getBrandById;
