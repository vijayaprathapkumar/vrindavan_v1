"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaqCategoryById = exports.updateFaqCategoryById = exports.getFaqCategoryById = exports.createFaqCategory = exports.getAllFaqCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all FAQ categories
const getAllFaqCategories = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT id, name, weightage FROM faq_categories");
    return rows;
};
exports.getAllFaqCategories = getAllFaqCategories;
// Create a new FAQ category
const createFaqCategory = async (name, weightage) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO faq_categories (name, weightage) VALUES (?, ?)", [name, weightage]);
};
exports.createFaqCategory = createFaqCategory;
// Fetch FAQ category by ID
const getFaqCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT id, name, weightage FROM faq_categories WHERE id = ?", [id]);
    return rows;
};
exports.getFaqCategoryById = getFaqCategoryById;
// Update FAQ category by ID
const updateFaqCategoryById = async (id, name, weightage) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE faq_categories SET name = ?, weightage = ? WHERE id = ?", [name, weightage, id]);
};
exports.updateFaqCategoryById = updateFaqCategoryById;
// Delete FAQ category by ID
const deleteFaqCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM faq_categories WHERE id = ?", [id]);
};
exports.deleteFaqCategoryById = deleteFaqCategoryById;
