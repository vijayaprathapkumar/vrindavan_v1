"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaq = exports.updateFaq = exports.getFaq = exports.addFaq = exports.getFaqs = void 0;
const faqsModel_1 = require("../../models/faqs/faqsModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all FAQs
const getFaqs = async (req, res) => {
    try {
        const faqs = await (0, faqsModel_1.getAllFaqs)();
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "FAQs fetched successfully", faqs));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching FAQs", error));
    }
};
exports.getFaqs = getFaqs;
// Add a new FAQ
const addFaq = async (req, res) => {
    const { question, answer, faqCategoryId, weightage } = req.body;
    try {
        await (0, faqsModel_1.createFaq)(question, answer, faqCategoryId, weightage);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "FAQ created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating FAQ", error));
    }
};
exports.addFaq = addFaq;
// Get FAQ by ID
const getFaq = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await (0, faqsModel_1.getFaqById)(parseInt(id));
        if (faq.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "FAQ not found"));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "FAQ fetched successfully", faq));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching FAQ", error));
    }
};
exports.getFaq = getFaq;
// Update FAQ by ID
const updateFaq = async (req, res) => {
    const { id } = req.params;
    const { question, answer, faqCategoryId, weightage } = req.body;
    try {
        await (0, faqsModel_1.updateFaqById)(parseInt(id), question, answer, faqCategoryId, weightage);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "FAQ updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating FAQ", error));
    }
};
exports.updateFaq = updateFaq;
// Delete FAQ by ID
const deleteFaq = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, faqsModel_1.deleteFaqById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "FAQ deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting FAQ", error));
    }
};
exports.deleteFaq = deleteFaq;
