"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryById = exports.updateCategoryById = exports.getCategoryById = exports.createCategory = exports.getCategoriesCount = exports.getAllCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all categories with limit and offset for pagination
const getAllCategories = async (limit, offset, searchTerm) => {
    const query = `
    SELECT * FROM categories 
    WHERE name LIKE ? OR weightage = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
    const params = [`%${searchTerm}%`, parseInt(searchTerm) || -1, limit, offset];
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    return rows;
};
exports.getAllCategories = getAllCategories;
// Fetch total count of categories that match the search term
const getCategoriesCount = async (searchTerm) => {
    const query = `
    SELECT COUNT(*) as count FROM categories 
    WHERE name LIKE ? OR weightage = ?
  `;
    const params = [`%${searchTerm}%`, parseInt(searchTerm) || -1];
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    return rows[0].count;
};
exports.getCategoriesCount = getCategoriesCount;
// Create a new category (with optional image)
const createCategory = async (name, description, weightage, image) => {
    const query = image
        ? `
      INSERT INTO categories (name, description, weightage, image, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `
        : `
      INSERT INTO categories (name, description, weightage, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    const params = image
        ? [name, description, weightage, image]
        : [name, description, weightage];
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
const updateCategoryById = async (id, name, description, weightage, image) => {
    let query = "UPDATE categories SET name = ?, description = ?, weightage = ?, updated_at = NOW()";
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
