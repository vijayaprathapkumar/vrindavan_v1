"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.addCategory = exports.getCategories = void 0;
const categoryModel_1 = require("../../models/inventory/categoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all categories with pagination and search
const getCategories = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm || ''; // Get search term
    const offset = (page - 1) * limit;
    try {
        // Fetch total count of categories that match the search term
        const totalCount = await (0, categoryModel_1.getCategoriesCount)(searchTerm);
        // Fetch limited categories that match the search term
        const categories = await (0, categoryModel_1.getAllCategories)(limit, offset, searchTerm);
        res.status(200).json({
            message: "Categories fetched successfully",
            data: categories,
            pagination: {
                totalEntries: totalCount,
                limit,
                page,
                totalPages: Math.ceil(totalCount / limit),
                showing: {
                    start: offset + 1,
                    end: Math.min(offset + limit, totalCount),
                },
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching categories", error));
    }
};
exports.getCategories = getCategories;
// Add a new category (POST)
const addCategory = async (req, res) => {
    const { name, description, weightage, image } = req.body;
    try {
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
            res.status(200).json((0, responseHandler_1.createResponse)(200, "Category fetched successfully", category));
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
