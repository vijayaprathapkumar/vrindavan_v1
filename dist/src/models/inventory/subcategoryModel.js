"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategoryById = exports.updateSubCategoryById = exports.getSubCategoryById = exports.createSubCategory = exports.getAllSubCategoriesWithCategory = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all subcategories with category relationship
const getAllSubCategoriesWithCategory = async () => {
    const query = `
    SELECT 
      sub_categories.*, 
      categories.name as category_name, 
      categories.description as category_description
    FROM 
      sub_categories
    LEFT JOIN 
      categories 
    ON 
      sub_categories.category_id = categories.id;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query);
    return rows;
};
exports.getAllSubCategoriesWithCategory = getAllSubCategoriesWithCategory;
// Create a new subcategory
const createSubCategory = async (category_id, name, description, weightage, active) => {
    const [result] = await databaseConnection_1.db
        .promise()
        .query("INSERT INTO sub_categories (category_id, name, description, weightage, active) VALUES (?, ?, ?, ?, ?)", [category_id, name, description, weightage, active]);
    return result;
};
exports.createSubCategory = createSubCategory;
// Fetch subcategory by ID
const getSubCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(`SELECT sub_categories.*, categories.name as category_name 
       FROM sub_categories 
       LEFT JOIN categories ON sub_categories.category_id = categories.id 
       WHERE sub_categories.id = ?`, [id]);
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
    await databaseConnection_1.db.promise().query("DELETE FROM sub_categories WHERE id = ?", [id]);
};
exports.deleteSubCategoryById = deleteSubCategoryById;
