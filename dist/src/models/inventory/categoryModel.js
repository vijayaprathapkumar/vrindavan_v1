"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryById = exports.updateCategoryById = exports.getCategoryById = exports.createCategory = exports.getAllCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all categories
const getAllCategories = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM categories");
    return rows;
};
exports.getAllCategories = getAllCategories;
// Create a new category
const createCategory = async (name, description, weightage, image) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO categories (name, description, weightage, image) VALUES (?, ?, ?, ?)", [name, description, weightage, image]);
};
exports.createCategory = createCategory;
// Fetch category by ID
const getCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM categories WHERE id = ?", [id]);
    return rows;
};
exports.getCategoryById = getCategoryById;
// Update category by ID
const updateCategoryById = async (id, name, description, weightage, image) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE categories SET name = ?, description = ?, weightage = ?, image = ? WHERE id = ?", [name, description, weightage, image, id]);
};
exports.updateCategoryById = updateCategoryById;
// Delete category by ID
const deleteCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM categories WHERE id = ?", [id]);
};
exports.deleteCategoryById = deleteCategoryById;
