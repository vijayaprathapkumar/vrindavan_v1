"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFood = exports.updateFood = exports.getFood = exports.addFood = exports.getFoods = void 0;
const foodModel_1 = require("../../models/inventory/foodModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all foods
const getFoods = async (req, res) => {
    try {
        const foods = await (0, foodModel_1.getAllFoods)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Foods fetched successfully", foods));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching foods", error));
    }
};
exports.getFoods = getFoods;
// Add a new food
const addFood = async (req, res) => {
    const { name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality } = req.body;
    try {
        await (0, foodModel_1.createFood)(name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Food created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating food", error));
    }
};
exports.addFood = addFood;
// Get food by ID
const getFood = async (req, res) => {
    const { id } = req.params;
    try {
        const food = await (0, foodModel_1.getFoodById)(parseInt(id));
        if (food.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Food not found"));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "Food fetched successfully", food));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching food", error));
    }
};
exports.getFood = getFood;
// Update food by ID
const updateFood = async (req, res) => {
    const { id } = req.params;
    const { name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality } = req.body;
    try {
        await (0, foodModel_1.updateFoodById)(parseInt(id), name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Food updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating food", error));
    }
};
exports.updateFood = updateFood;
// Delete food by ID
const deleteFood = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, foodModel_1.deleteFoodById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Food deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting food", error));
    }
};
exports.deleteFood = deleteFood;
