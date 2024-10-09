"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.addCategory = exports.getCategories = void 0;
const categoryModel_1 = require("../../models/inventory/categoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all categories with pagination and search
const getCategories = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm || "";
    const offset = (page - 1) * limit;
    try {
        const totalCount = await (0, categoryModel_1.getCategoriesCount)(searchTerm);
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
        await (0, categoryModel_1.createCategory)(name, description, weightage, image);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Category created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating category", error));
    }
};
exports.addCategory = addCategory;
const getCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await (0, categoryModel_1.getCategoryById)(parseInt(id)); // Fetch rows from the database
        if (rows.length === 0) {
            // Handle case where no category is found
            throw new Error("Category not found");
        }
        const category = {
            category_id: rows[0].category_id,
            category_name: rows[0].category_name,
            description: rows[0].description,
            weightage: rows[0].weightage,
            category_created_at: rows[0].category_created_at,
        };
        const media = rows
            .map((row) => ({
            media_id: row.media_id,
            file_name: row.file_name,
            mime_type: row.mime_type,
            disk: row.disk,
            conversions_disk: row.conversions_disk,
            size: row.size,
            manipulations: row.manipulations,
            custom_properties: row.custom_properties,
            generated_conversions: row.generated_conversions,
            responsive_images: row.responsive_images,
            order_column: row.order_column,
            created_at: row.media_created_at,
            updated_at: row.media_updated_at,
            original_url: row.original_url,
        }))
            .filter((mediaItem) => mediaItem.media_id !== null);
        // Send response
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Category fetched successfully", {
            category,
            media,
        }));
    }
    catch (error) {
        const statusCode = error.message === "Category not found" ? 404 : 500;
        res.status(statusCode).json((0, responseHandler_1.createResponse)(statusCode, error.message));
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
