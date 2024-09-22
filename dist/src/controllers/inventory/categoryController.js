"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.addCategory = exports.getCategories = void 0;
const categoryModel_1 = require("../../models/inventory/categoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all categories
const getCategories = async (req, res) => {
    try {
        const categories = await (0, categoryModel_1.getAllCategories)();
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Categories fetched successfully", categories));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching categories", error));
    }
};
exports.getCategories = getCategories;
// Add a new category (POST)
const addCategory = async (req, res) => {
    const { name, description, weightage, image } = req.body;
    try {
        // Pass image only if it's provided
        await (0, categoryModel_1.createCategory)(name, description, weightage, image);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Category created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating category", error));
    }
};
exports.addCategory = addCategory;
// Get category by ID
const getCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await (0, categoryModel_1.getCategoryById)(parseInt(id));
        if (category.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Category not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Category fetched successfully", category));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching category", error));
    }
};
exports.getCategory = getCategory;
// Update category by ID (PUT)
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, weightage, image } = req.body;
    try {
        // Pass image only if it's provided
        await (0, categoryModel_1.updateCategoryById)(parseInt(id), name, description, weightage, image);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Category updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating category", error));
    }
};
exports.updateCategory = updateCategory;
// Delete category by ID
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, categoryModel_1.deleteCategoryById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Category deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting category", error));
    }
};
exports.deleteCategory = deleteCategory;
