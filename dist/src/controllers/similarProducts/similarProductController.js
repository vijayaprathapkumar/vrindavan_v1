"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSimilarProducts = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const similarProductModel_1 = require("../../models/similarProducts/similarProductModel");
const fetchSimilarProducts = async (req, res) => {
    const foodId = parseInt(req.params.foodId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    if (isNaN(foodId) || foodId <= 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid food ID."));
    }
    try {
        const subcategoryId = await (0, similarProductModel_1.getSubcategoryId)(foodId);
        if (!subcategoryId) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Subcategory not found for this food ID."));
        }
        const { products, totalProducts } = await (0, similarProductModel_1.getSimilarProductsWithCount)(subcategoryId, foodId, limit, offset);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Similar products fetched successfully.", {
            products,
            currentPage: page,
            limit,
            totalPages: Math.ceil(totalProducts / limit),
            totalItems: totalProducts,
        }));
    }
    catch (error) {
        console.error(`Error fetching similar products for food ID ${foodId}:`, error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch similar products."));
    }
};
exports.fetchSimilarProducts = fetchSimilarProducts;
