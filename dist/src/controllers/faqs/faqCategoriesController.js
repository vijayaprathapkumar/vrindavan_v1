"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFaqCategory = exports.updateFaqCategory = exports.getFaqCategory = exports.addFaqCategory = exports.getFaqCategories = void 0;
const faqCategoryModel_1 = require("../../models/faqs/faqCategoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all FAQ categories
const getFaqCategories = async (req, res) => {
    try {
        const faqCategories = await (0, faqCategoryModel_1.getAllFaqCategories)();
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "FAQ Categories fetched successfully", faqCategories));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching FAQ categories", error));
    }
};
exports.getFaqCategories = getFaqCategories;
// Add a new FAQ category
const addFaqCategory = async (req, res) => {
    const { name, weightage } = req.body;
    try {
        await (0, faqCategoryModel_1.createFaqCategory)(name, weightage);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "FAQ Category created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating FAQ category", error));
    }
};
exports.addFaqCategory = addFaqCategory;
// Get FAQ category by ID
const getFaqCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const faqCategory = await (0, faqCategoryModel_1.getFaqCategoryById)(parseInt(id));
        if (faqCategory.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "FAQ Category not found"));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "FAQ Category fetched successfully", faqCategory));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching FAQ category", error));
    }
};
exports.getFaqCategory = getFaqCategory;
// Update FAQ category by ID
const updateFaqCategory = async (req, res) => {
    const { id } = req.params;
    const { name, weightage } = req.body;
    try {
        await (0, faqCategoryModel_1.updateFaqCategoryById)(parseInt(id), name, weightage);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "FAQ Category updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating FAQ category", error));
    }
};
exports.updateFaqCategory = updateFaqCategory;
// Delete FAQ category by ID
const deleteFaqCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, faqCategoryModel_1.deleteFaqCategoryById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "FAQ Category deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting FAQ category", error));
    }
};
exports.deleteFaqCategory = deleteFaqCategory;
