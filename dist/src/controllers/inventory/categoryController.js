"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.addCategory = exports.getCategories = void 0;
const categoryModel_1 = require("../../models/inventory/categoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
const imageUploadController_1 = require("../imageUpload/imageUploadController");
// Fetch all categories with pagination and search
const getCategories = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm || "";
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "ASC";
    const offset = (page - 1) * limit;
    try {
        const { rows: categories, total: totalCount } = await (0, categoryModel_1.getAllCategories)(limit, offset, searchTerm, sortField, sortOrder);
        const totalPages = Math.ceil(totalCount / limit);
        const categoriesWithMedia = categories.map((category) => {
            const categoryResponse = {
                category_id: category.category_id,
                category_name: category.category_name,
                description: category.description,
                weightage: category.weightage,
                created_at: category.created_at,
                updated_at: category.updated_at,
                media: [],
            };
            if (category.media_id) {
                categoryResponse.media.push({
                    media_id: category.media_id,
                    file_name: category.file_name,
                    mime_type: category.mime_type,
                    disk: category.disk,
                    conversions_disk: category.conversions_disk,
                    size: category.size,
                    manipulations: category.manipulations,
                    custom_properties: category.custom_properties,
                    generated_conversions: category.generated_conversions,
                    responsive_images: category.responsive_images,
                    order_column: category.order_column,
                    created_at: category.media_created_at,
                    updated_at: category.media_updated_at,
                    original_url: category.original_url,
                });
            }
            return categoryResponse;
        });
        res.status(200).json({
            statusCode: 200,
            message: "Categories fetched successfully",
            data: {
                categories: categoriesWithMedia,
                totalCount,
                currentPage: page,
                limit,
                totalPages,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching categories", error.message));
    }
};
exports.getCategories = getCategories;
// Add a new category (POST)
const addCategory = async (req, res) => {
    const { name, description, weightage, media } = req.body;
    try {
        const categoryId = await (0, categoryModel_1.createCategory)(name, description, weightage);
        if (media) {
            const { model_type, file_name, mime_type, size } = media;
            await (0, imageUploadController_1.insertMediaRecord)(model_type, categoryId, file_name, mime_type, size);
        }
        res.status(201).json({
            statusCode: 201,
            message: "Category created successfully",
            data: null,
        });
    }
    catch (error) {
        console.error("Error in addCategory:", error);
        res.status(500).json({
            statusCode: 500,
            message: "Error creating category",
            error: error.message,
        });
    }
};
exports.addCategory = addCategory;
// Get category by ID (GET)
const getCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await (0, categoryModel_1.getCategoryById)(parseInt(id));
        if (rows.length === 0) {
            throw new Error("Category not found");
        }
        const category = {
            category_id: rows[0].category_id,
            category_name: rows[0].category_name,
            description: rows[0].description,
            weightage: rows[0].weightage,
            category_created_at: rows[0].category_created_at,
            media: rows
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
                .filter((mediaItem) => mediaItem.media_id !== null),
        };
        res.status(200).json({
            statusCode: 200,
            message: "Category fetched successfully",
            data: {
                category: [category],
            },
        });
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
    const { name, description, weightage, media } = req.body;
    try {
        await (0, categoryModel_1.updateCategoryById)(parseInt(id), name, description, weightage);
        if (media && media.media_id) {
            const { media_id, file_name, mime_type, size } = media;
            await (0, imageUploadController_1.updateMediaRecord)(media_id, file_name, mime_type, size);
        }
        res.status(200).json({
            statusCode: 200,
            message: "Category updated successfully",
            data: {
                updateCategory_id: parseInt(id),
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating category", error.message));
    }
};
exports.updateCategory = updateCategory;
// Delete category by ID (DELETE)
const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, categoryModel_1.deleteCategoryById)(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: "Category deleted successfully",
            data: {
                deleted_category_id: parseInt(id),
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting category", error.message));
    }
};
exports.deleteCategory = deleteCategory;
