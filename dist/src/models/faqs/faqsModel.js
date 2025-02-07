"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaqById = exports.updateFaqById = exports.getFaqById = exports.createFaq = exports.getAllFaqs = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all FAQs
const getAllFaqs = async (page = 1, limit = 10, searchTerm = "", faqCategoryId, sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    const validSortFields = {
        question: "f.question",
        answer: "f.answer",
        category_name: "fc.name",
        weightage: "CAST(f.weightage AS UNSIGNED)",
        updated_at: "f.updated_at",
    };
    const sortColumn = validSortFields[sortField] || validSortFields.question;
    const validSortOrder = sortOrder === "desc" ? "desc" : "asc";
    let whereClause = `
    WHERE 
      (f.question LIKE ? OR f.answer LIKE ? OR fc.name LIKE ?)
  `;
    const queryParams = [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        limit,
        offset,
    ];
    if (faqCategoryId) {
        whereClause += ` AND f.faq_category_id = ?`;
        queryParams.splice(3, 0, faqCategoryId);
    }
    const searchQuery = `
    SELECT
      f.id,
      f.question,
      f.answer,
      f.weightage,
      f.faq_category_id,
      fc.name AS category_name,
      f.created_at,
      f.updated_at
    FROM faqs f
    LEFT JOIN faq_categories fc ON f.faq_category_id = fc.id
    ${whereClause}
   ORDER BY ${sortColumn} ${validSortOrder}
    LIMIT ? OFFSET ?
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(searchQuery, queryParams);
    const totalQuery = `
    SELECT COUNT(*) AS total
    FROM faqs f
    LEFT JOIN faq_categories fc ON f.faq_category_id = fc.id
    ${whereClause.replace("LIMIT ? OFFSET ?", "")}  -- Exclude limit/offset
  `;
    const [[{ total }]] = await databaseConnection_1.db
        .promise()
        .query(totalQuery, queryParams.slice(0, faqCategoryId ? 4 : 3));
    return { faqs: rows, total };
};
exports.getAllFaqs = getAllFaqs;
// Create a new FAQ
const createFaq = async (question, answer, faqCategoryId, weightage) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO faqs (question, answer, faq_category_id, weightage,created_at,updated_at) VALUES (?, ?, ?, ?,NOW(),NOW())", [question, answer, faqCategoryId, weightage]);
};
exports.createFaq = createFaq;
// Fetch FAQ by ID
const getFaqById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query(`
      SELECT    
        f.id, 
        f.question, 
        f.answer, 
        f.weightage,
        f.faq_category_id, 
        fc.name AS category_name, 
        f.created_at, 
        f.updated_at
      FROM faqs f 
      LEFT JOIN faq_categories fc ON f.faq_category_id = fc.id
      WHERE f.id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
};
exports.getFaqById = getFaqById;
// Update FAQ by ID
const updateFaqById = async (id, question, answer, faqCategoryId, weightage) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE faqs SET question = ?, answer = ?, faq_category_id = ?, weightage = ? WHERE id = ?", [question, answer, faqCategoryId, weightage, id]);
};
exports.updateFaqById = updateFaqById;
// Delete FAQ by ID
const deleteFaqById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM faqs WHERE id = ?", [id]);
};
exports.deleteFaqById = deleteFaqById;
