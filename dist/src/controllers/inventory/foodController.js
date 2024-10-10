"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFood = exports.updateFood = exports.createFood = exports.getFoodById = exports.getAllFoods = void 0;
const foodModel = __importStar(require("../../models/inventory/foodModel"));
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all foods with pagination and filters
const getAllFoods = async (req, res) => {
    try {
        const { status, categoryId, subcategoryId, searchTerm, page = "1", limit = "10", } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;
        const offset = (pageNumber - 1) * limitNumber;
        const filters = {
            status: status ? status === "true" : undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
            subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
            searchTerm: searchTerm ? String(searchTerm) : undefined,
        };
        const { foods, totalItems } = await foodModel.getAllFoods(filters, limitNumber, offset);
        const totalPages = Math.ceil(totalItems / limitNumber);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Foods fetched successfully", {
            foods,
            pagination: {
                totalItems,
                totalPages,
                currentPage: pageNumber,
                pageSize: limitNumber,
            },
        }));
    }
    catch (error) {
        console.error(error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching foods", error));
    }
};
exports.getAllFoods = getAllFoods;
// Fetch a single food by ID
const getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await foodModel.getFoodById(Number(id));
        if (food) {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Food fetched successfully", food));
        }
        else {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Food not found"));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching food", error));
    }
};
exports.getFoodById = getFoodById;
// Create a new food item
const createFood = async (req, res) => {
    try {
        const foodData = req.body;
        // Ensure foodData has all required fields
        if (!foodData.name || !foodData.price || !foodData.restaurant_id || !foodData.category_id) {
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "Missing required fields"));
        }
        const newFood = await foodModel.createFood(foodData);
        res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Food created successfully", newFood));
    }
    catch (error) {
        console.error("Error creating food:", error); // Log the error for debugging
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating food", error.message));
    }
};
exports.createFood = createFood;
// Update an existing food item by ID
const updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const foodData = req.body;
        const updatedFood = await foodModel.updateFood(Number(id), foodData);
        if (updatedFood) {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Food updated successfully", updatedFood));
        }
        else {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Food not found"));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating food", error));
    }
};
exports.updateFood = updateFood;
// Delete a food item by ID
const deleteFood = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await foodModel.deleteFood(Number(id));
        if (deleted) {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "Food deleted successfully"));
        }
        else {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Food not found"));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting food", error));
    }
};
exports.deleteFood = deleteFood;
