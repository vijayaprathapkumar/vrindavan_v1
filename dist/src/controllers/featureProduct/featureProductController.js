"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchFeaturedCategories = void 0;
const featureProductModel_1 = require("../../models/featureProduct/featureProductModel");
const responseHandler_1 = require("../../utils/responseHandler");
const fetchFeaturedCategories = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const featuredCategories = await (0, featureProductModel_1.getFeaturedCategories)(limit, offset);
        const totalFeaturedCategories = await (0, featureProductModel_1.getCountOfFeaturedCategories)();
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Featured categories fetched successfully.", {
            featuredCategories,
            currentPage: page,
            limit,
            totalPages: Math.ceil(totalFeaturedCategories / limit),
            totalItems: totalFeaturedCategories,
        }));
    }
    catch (error) {
        console.error("Error fetching featured categories:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch featured categories."));
    }
};
exports.fetchFeaturedCategories = fetchFeaturedCategories;
