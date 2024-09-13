"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategoryById = exports.updateSubCategoryById = exports.getSubCategoryById = exports.createSubCategory = exports.getAllSubCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all subcategories
const getAllSubCategories = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM sub_categories");
    return rows;
};
exports.getAllSubCategories = getAllSubCategories;
// Create a new subcategory
const createSubCategory = async (category_id, name, description, weightage, active) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO sub_categories (category_id, name, description, weightage, active) VALUES (?, ?, ?, ?, ?)", [category_id, name, description, weightage, active]);
};
exports.createSubCategory = createSubCategory;
// Fetch subcategory by ID
const getSubCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM sub_categories WHERE id = ?", [id]);
    return rows;
};
exports.getSubCategoryById = getSubCategoryById;
// Update subcategory by ID
const updateSubCategoryById = async (id, category_id, name, description, weightage, active) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE sub_categories SET category_id = ?, name = ?, description = ?, weightage = ?, active = ? WHERE id = ?", [category_id, name, description, weightage, active, id]);
};
exports.updateSubCategoryById = updateSubCategoryById;
// Delete subcategory by ID
const deleteSubCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM sub_categories WHERE id = ?", [id]);
};
exports.deleteSubCategoryById = deleteSubCategoryById;
