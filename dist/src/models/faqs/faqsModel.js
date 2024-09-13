"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaqById = exports.updateFaqById = exports.getFaqById = exports.createFaq = exports.getAllFaqs = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all FAQs
const getAllFaqs = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM faqs");
    return rows;
};
exports.getAllFaqs = getAllFaqs;
// Create a new FAQ
const createFaq = async (question, answer, faqCategoryId, weightage) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO faqs (question, answer, faq_category_id, weightage) VALUES (?, ?, ?, ?)", [question, answer, faqCategoryId, weightage]);
};
exports.createFaq = createFaq;
// Fetch FAQ by ID
const getFaqById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM faqs WHERE id = ?", [id]);
    return rows;
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
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM faqs WHERE id = ?", [id]);
};
exports.deleteFaqById = deleteFaqById;
