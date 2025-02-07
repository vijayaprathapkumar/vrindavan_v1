"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFeaturedCategory = exports.fetchFeaturedCategories = void 0;
const featureProductModel_1 = require("../../models/featureProduct/featureProductModel");
const responseHandler_1 = require("../../utils/responseHandler");
const fetchFeaturedCategories = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.searchTerm;
    try {
        const featuredCategories = await (0, featureProductModel_1.getFeaturedCategories)(limit, offset, searchTerm);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Featured categories fetched successfully.", {
            featuredCategories: featuredCategories.data,
            currentPage: page,
            limit,
            totalPages: Math.ceil(featuredCategories.totalItems / limit),
            totalItems: featuredCategories.totalItems,
        }));
    }
    catch (error) {
        console.error("Error fetching featured categories:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch featured categories."));
    }
};
exports.fetchFeaturedCategories = fetchFeaturedCategories;
const addFeaturedCategory = async (req, res) => {
    const { category_id, sub_category_id, status, category_type } = req.body;
    if (!category_id || typeof status === 'undefined') {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Missing required fields: category_id and status are mandatory."));
    }
    try {
        const newCategory = await (0, featureProductModel_1.createFeaturedCategory)({ category_id, sub_category_id, status, category_type });
        return res.status(201).json((0, responseHandler_1.createResponse)(201, "Featured category added successfully.", newCategory));
    }
    catch (error) {
        console.error("Error adding featured category:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to add featured category."));
    }
};
exports.addFeaturedCategory = addFeaturedCategory;
