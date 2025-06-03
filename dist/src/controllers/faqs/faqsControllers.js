"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaq = exports.updateFaq = exports.getFaq = exports.addFaq = exports.getFaqs = void 0;
const faqsModel_1 = require("../../models/faqs/faqsModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all FAQs
const getFaqs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const searchTerm = req.query.searchTerm || "";
        const faqCategoryId = req.query.faqCategoryId
            ? req.query.faqCategoryId === "All"
                ? undefined
                : parseInt(req.query.faqCategoryId)
            : undefined;
        const sortField = String(req.query.sortField || "");
        const sortOrder = String(req.query.sortOrder || "");
        if (faqCategoryId !== undefined && isNaN(faqCategoryId)) {
            res.status(400).json({
                status: 400,
                message: "Invalid faqCategoryId",
            });
            return;
        }
        const { faqs, total } = await (0, faqsModel_1.getAllFaqs)(page, limit, searchTerm, faqCategoryId, sortField, sortOrder);
        res.status(200).json({
            status: 200,
            message: "FAQs fetched successfully",
            data: {
                faqs,
                currentPage: page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalCount: total,
            },
        });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ status: 500, message: "Error fetching FAQs", error });
        return;
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
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid FAQ ID"));
            return;
        }
        const faq = await (0, faqsModel_1.getFaqById)(id);
        if (!faq) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "FAQ not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "FAQ fetched successfully", faq));
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
