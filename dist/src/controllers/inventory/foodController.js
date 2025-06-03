"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyStock = exports.removeFood = exports.modifyFood = exports.addFood = exports.fetchFoodById = exports.fetchAllFoods = void 0;
const foodModel_1 = require("../../models/inventory/foodModel");
const responseHandler_1 = require("../../utils/responseHandler");
const imageUploadController_1 = require("../imageUpload/imageUploadController");
const fetchAllFoods = async (req, res) => {
    try {
        const { status, categoryId, subcategoryId, searchTerm, sortField, sortOrder, } = req.query;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const filters = {
            status,
            categoryId,
            subcategoryId,
            searchTerm: searchTerm ? searchTerm.toString() : null,
        };
        const { foods, totalCount } = await (0, foodModel_1.getAllFoods)(filters, limit, offset, sortField, sortOrder);
        return res.status(200).json({
            statusCode: 200,
            message: "Foods fetched successfully",
            data: {
                foods,
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
        const { food } = await (0, foodModel_1.getFoodById)(foodId);
        if (food) {
            const foodsData = [food];
            return res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Food fetched successfully", { foods: foodsData }));
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
        const foodId = await (0, foodModel_1.createFood)(foodData);
        if (foodData.media) {
            const { model_type, file_name, mime_type, size } = foodData.media;
            await (0, imageUploadController_1.insertMediaRecord)(model_type, foodId, file_name, mime_type, size);
        }
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
            if (foodData?.media && foodData?.media.media_id) {
                const { media_id, file_name, mime_type, size } = foodData?.media;
                await (0, imageUploadController_1.updateMediaRecord)(media_id, file_name, mime_type, size);
            }
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
// out of stock
const modifyStock = async (req, res) => {
    try {
        const { foodId, amount, description, type } = req.body;
        console.log(`foodId :${foodId},amount :${amount},description :${description},type :${type}`);
        if (!["add", "sub"].includes(type)) {
            return res.status(400).json({
                statusCode: 400,
                message: "Invalid stock update type. Must be 'add' or 'sub'.",
            });
        }
        const amountChange = type === "add" ? amount : -Math.abs(amount);
        console.log("amountChange", amountChange);
        await (0, foodModel_1.updateStock)(foodId, amountChange, type, description);
        return res.status(200).json({
            statusCode: 200,
            message: "Stock updated successfully",
        });
    }
    catch (error) {
        console.error("Error modifying stock:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Error modifying stock",
            error: error.message,
        });
    }
};
exports.modifyStock = modifyStock;
