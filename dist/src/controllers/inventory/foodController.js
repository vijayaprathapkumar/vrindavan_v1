"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFood = exports.modifyFood = exports.addFood = exports.fetchFoodById = exports.fetchAllFoods = void 0;
const foodModel_1 = require("../../models/inventory/foodModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Get all foods
// Get all foods
const fetchAllFoods = async (req, res) => {
    try {
        const { status, categoryId, subcategoryId, searchTerm } = req.query;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const filters = {
            status: status !== undefined ? status === "true" : undefined,
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            subcategoryId: subcategoryId
                ? parseInt(subcategoryId)
                : undefined,
            searchTerm: searchTerm ? searchTerm.toString() : undefined,
        };
        const { foods, totalCount } = await (0, foodModel_1.getAllFoods)(filters, limit, offset);
        const foodsResponse = foods.map((food) => ({
            food_id: food.id,
            food_name: food.name,
            description: food.description,
            weightage: food.weightage,
            media: food.media
                ? food.media.map((item) => ({
                    media_id: item.id,
                    file_name: item.file_name,
                    mime_type: item.mime_type,
                    disk: item.disk,
                    conversions_disk: item.conversions_disk,
                    size: item.size,
                    manipulations: item.manipulations,
                    custom_properties: item.custom_properties,
                    generated_conversions: item.generated_conversions,
                    responsive_images: item.responsive_images,
                    order_column: item.order_column,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                    original_url: item.original_url,
                }))
                : [],
        }));
        return res.status(200).json({
            statusCode: 200,
            message: "Foods fetched successfully",
            data: {
                foods: foodsResponse,
                totalCount,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
            },
        });
    }
    catch (error) {
        console.error("Error fetching foods:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching foods", error.message));
    }
};
exports.fetchAllFoods = fetchAllFoods;
// Get food by ID
const fetchFoodById = async (req, res) => {
    const foodId = parseInt(req.params.id);
    if (isNaN(foodId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid food ID"));
    }
    try {
        const { food, media } = await (0, foodModel_1.getFoodById)(foodId);
        if (food) {
            const foodResponse = {
                food_id: food.id,
                food_name: food.name,
                description: food.description,
                weightage: food.weightage,
                media: media
                    ? media.map((item) => ({
                        media_id: item.id,
                        file_name: item.file_name,
                        mime_type: item.mime_type,
                        disk: item.disk,
                        conversions_disk: item.conversions_disk,
                        size: item.size,
                        manipulations: item.manipulations,
                        custom_properties: item.custom_properties,
                        generated_conversions: item.generated_conversions,
                        responsive_images: item.responsive_images,
                        order_column: item.order_column,
                        created_at: item.created_at,
                        updated_at: item.updated_at,
                        original_url: item.original_url,
                    }))
                    : [],
            };
            return res.status(200).json({
                statusCode: 200,
                message: "Food fetched successfully",
                data: {
                    food: foodResponse,
                },
            });
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Food not found"));
        }
    }
    catch (error) {
        console.error("Error fetching food:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching food", error.message));
    }
};
exports.fetchFoodById = fetchFoodById;
// Create food
const addFood = async (req, res) => {
    try {
        const foodData = req.body;
        const newFood = await (0, foodModel_1.createFood)(foodData);
        return res.status(201).json({
            statusCode: 201,
            message: "Food created successfully",
            data: null,
        });
    }
    catch (error) {
        console.error("Error creating food:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating food", error.message));
    }
};
exports.addFood = addFood;
// Update food
const modifyFood = async (req, res) => {
    const foodId = parseInt(req.params.id);
    if (isNaN(foodId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid food ID"));
    }
    try {
        const foodData = req.body;
        const updatedFood = await (0, foodModel_1.updateFood)(foodId, foodData);
        if (updatedFood) {
            return res.status(200).json({
                statusCode: 200,
                message: "Food updated successfully",
                data: {
                    updateFood_id: updatedFood.id,
                },
            });
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Food not found"));
        }
    }
    catch (error) {
        console.error("Error updating food:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating food", error.message));
    }
};
exports.modifyFood = modifyFood;
// Delete food
const removeFood = async (req, res) => {
    const foodId = parseInt(req.params.id);
    if (isNaN(foodId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid food ID"));
    }
    try {
        const deleted = await (0, foodModel_1.deleteFood)(foodId);
        if (deleted) {
            return res.status(200).json({
                statusCode: 200,
                message: "Food deleted successfully",
                data: {
                    deleteFood_id: foodId,
                },
            });
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Food not found"));
        }
    }
    catch (error) {
        console.error("Error deleting food:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting food", error.message));
    }
};
exports.removeFood = removeFood;
