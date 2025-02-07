"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaqCategoryById = exports.updateFaqCategoryById = exports.getFaqCategoryById = exports.createFaqCategory = exports.getAllFaqCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all FAQ categories
const getAllFaqCategories = async (page = 1, limit = 10, searchTerm = "", sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    const validSortFields = {
        name: "faq_categories.name",
        weightage: "CAST(faq_categories.weightage AS UNSIGNED)",
        updated_at: "faq_categories.updated_at",
    };
    const sortColumn = validSortFields[sortField] || validSortFields.name;
    const validSortOrder = sortOrder === "desc" ? "desc" : "asc";
    const searchQuery = `
    SELECT id, name, weightage, created_at, updated_at 
    FROM faq_categories
    WHERE name LIKE ? OR CAST(faq_categories.weightage AS UNSIGNED) LIKE ?
    ORDER BY ${sortColumn} ${validSortOrder}
    LIMIT ? OFFSET ?
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(searchQuery, [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset]);
    const totalQuery = `
    SELECT COUNT(*) AS total 
    FROM faq_categories
    WHERE name LIKE ?
  `;
    const [[{ total }]] = await databaseConnection_1.db
        .promise()
        .query(totalQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
    return { faqCategories: rows, total };
};
exports.getAllFaqCategories = getAllFaqCategories;
// Create a new FAQ category
const createFaqCategory = async (name, weightage) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO faq_categories (name, weightage,created_at,updated_at) VALUES (?, ?,NOW(),NOW())", [name, weightage]);
};
exports.createFaqCategory = createFaqCategory;
// Fetch FAQ category by ID
const getFaqCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT id, name, weightage, created_at, updated_at FROM faq_categories WHERE id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
};
exports.getFaqCategoryById = getFaqCategoryById;
// Update FAQ category by ID
const updateFaqCategoryById = async (id, name, weightage) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE faq_categories SET name = ?, weightage = ?, updated_at = NOW() WHERE id = ?", [name, weightage, id]);
};
exports.updateFaqCategoryById = updateFaqCategoryById;
// Delete FAQ category by ID
const deleteFaqCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM faq_categories WHERE id = ?", [id]);
};
exports.deleteFaqCategoryById = deleteFaqCategoryById;
