"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubcategory = exports.updateSubcategory = exports.getSubcategory = exports.addSubcategory = exports.getSubcategories = void 0;
const subcategoryModel_1 = require("../../models/inventory/subcategoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all subcategories with pagination and search
const getSubcategories = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm || "";
    const offset = (page - 1) * limit;
    try {
        const totalCount = await (0, subcategoryModel_1.getSubcategoriesCount)(searchTerm);
        const subcategories = await (0, subcategoryModel_1.getAllSubCategoriesWithCategory)(limit, offset, searchTerm);
        const totalPages = Math.ceil(totalCount / limit);
        const subcategoriesWithMedia = subcategories.map(subcategory => {
            const subcategoryResponse = {
                subcategory_id: subcategory.id,
                subcategory_name: subcategory.name,
                description: subcategory.description,
                weightage: subcategory.weightage,
                subcategory_created_at: subcategory.created_at,
                media: [],
            };
            if (subcategory.media_id) {
                subcategoryResponse.media.push({
                    media_id: subcategory.media_id,
                    file_name: subcategory.file_name,
                    mime_type: subcategory.mime_type,
                    disk: subcategory.disk,
                    conversions_disk: subcategory.conversions_disk,
                    size: subcategory.size,
                    manipulations: subcategory.manipulations,
                    custom_properties: subcategory.custom_properties,
                    generated_conversions: subcategory.generated_conversions,
                    responsive_images: subcategory.responsive_images,
                    order_column: subcategory.order_column,
                    created_at: subcategory.media_created_at,
                    updated_at: subcategory.media_updated_at,
                    original_url: subcategory.original_url,
                });
            }
            return subcategoryResponse;
        });
        res.status(200).json({
            statusCode: 200,
            message: "Subcategories fetched successfully",
            data: {
                subcategories: subcategoriesWithMedia,
                totalCount,
                currentPage: page,
                limit,
                totalPages,
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching subcategories", error.message));
    }
};
exports.getSubcategories = getSubcategories;
// Add a new subcategory (POST)
const addSubcategory = async (req, res) => {
    const { category_id, name, description, weightage, active } = req.body;
    try {
        await (0, subcategoryModel_1.createSubCategory)(category_id, name, description, weightage, active);
        res.status(201).json({
            statusCode: 201,
            message: "Subcategory created successfully",
            data: null,
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating subcategory", error.message));
    }
};
exports.addSubcategory = addSubcategory;
// Get subcategory by ID (GET)
const getSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        const rows = await (0, subcategoryModel_1.getSubCategoryById)(parseInt(id));
        if (rows.length === 0) {
            throw new Error("Subcategory not found");
        }
        const subcategory = {
            subcategory_id: rows[0].id,
            subcategory_name: rows[0].name,
            description: rows[0].description,
            weightage: rows[0].weightage,
            subcategory_created_at: rows[0].created_at,
            media: rows.map(row => ({
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
            })).filter(mediaItem => mediaItem.media_id !== null),
        };
        res.status(200).json({
            statusCode: 200,
            message: "Subcategory fetched successfully",
            data: {
                subcategory: subcategory,
            },
        });
    }
    catch (error) {
        const statusCode = error.message === "Subcategory not found" ? 404 : 500;
        res.status(statusCode).json((0, responseHandler_1.createResponse)(statusCode, error.message));
    }
};
exports.getSubcategory = getSubcategory;
// Update subcategory by ID (PUT)
const updateSubcategory = async (req, res) => {
    const { id } = req.params;
    const { category_id, name, description, weightage, active } = req.body;
    try {
        await (0, subcategoryModel_1.updateSubCategoryById)(parseInt(id), category_id, name, description, weightage, active);
        res.status(200).json({
            statusCode: 200,
            message: "Subcategory updated successfully",
            data: {
                updateSubcategory_id: parseInt(id),
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating subcategory", error.message));
    }
};
exports.updateSubcategory = updateSubcategory;
// Delete subcategory by ID (DELETE)
const deleteSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, subcategoryModel_1.deleteSubCategoryById)(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: "Subcategory deleted successfully",
            data: {
                deleted_subcategory_id: parseInt(id),
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting subcategory", error.message));
    }
};
exports.deleteSubcategory = deleteSubcategory;
