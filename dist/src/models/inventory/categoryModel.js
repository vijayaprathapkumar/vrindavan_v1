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
// Create a new category (with optional image)
const createCategory = async (name, description, weightage, image // Optional image
) => {
    const query = image
        ? "INSERT INTO categories (name, description, weightage, image) VALUES (?, ?, ?, ?)"
        : "INSERT INTO categories (name, description, weightage) VALUES (?, ?, ?)";
    const params = image ? [name, description, weightage, image] : [name, description, weightage];
    await databaseConnection_1.db.promise().query(query, params);
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
// Update category by ID (with optional image)
const updateCategoryById = async (id, name, description, weightage, image // Optional image
) => {
    let query = "UPDATE categories SET name = ?, description = ?, weightage = ?";
    const params = [name, description, weightage];
    if (image) {
        query += ", image = ?";
        params.push(image);
    }
    query += " WHERE id = ?";
    params.push(id);
    await databaseConnection_1.db.promise().query(query, params);
};
exports.updateCategoryById = updateCategoryById;
// Delete category by ID
const deleteCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM categories WHERE id = ?", [id]);
};
exports.deleteCategoryById = deleteCategoryById;
