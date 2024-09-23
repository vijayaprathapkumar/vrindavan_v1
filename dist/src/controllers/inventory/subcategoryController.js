"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategory = exports.updateSubCategory = exports.getSubCategory = exports.addSubCategory = exports.getSubCategoriesWithCategory = void 0;
const subcategoryModel_1 = require("../../models/inventory/subcategoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all subcategories with category relationship
const getSubCategoriesWithCategory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const searchTerm = req.query.searchTerm || "";
        const offset = (page - 1) * limit;
        // Get total count of subcategories matching the search term
        const [totalCountRows] = await databaseConnection_1.db
            .promise()
            .query("SELECT COUNT(*) as total FROM sub_categories WHERE name LIKE ?", [`%${searchTerm}%`]);
        const totalCount = totalCountRows[0]?.total || 0;
        // Fetch the paginated subcategories
        const subCategories = await (0, subcategoryModel_1.getAllSubCategoriesWithCategory)(limit, offset, searchTerm);
        const response = {
            data: subCategories,
            totalCount,
            limit,
            page,
            totalPages: Math.ceil(totalCount / limit),
        };
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subcategories with categories fetched successfully", response));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching subcategories with categories", error));
    }
};
exports.getSubCategoriesWithCategory = getSubCategoriesWithCategory;
// Add a new subcategory
const addSubCategory = async (req, res) => {
    const { category_id, name, description, weightage, active } = req.body;
    try {
        const result = await (0, subcategoryModel_1.createSubCategory)(category_id, name, description, weightage, active);
        res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Subcategory created successfully", {
            insertId: result.insertId,
        }));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating subcategory", error));
    }
};
exports.addSubCategory = addSubCategory;
// Get subcategory by ID
const getSubCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const subCategory = await (0, subcategoryModel_1.getSubCategoryById)(parseInt(id));
        if (subCategory.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Subcategory not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Subcategory fetched successfully", subCategory[0]));
        }
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching subcategory", error));
    }
};
exports.getSubCategory = getSubCategory;
// Update subcategory by ID
const updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const { category_id, name, description, weightage, active } = req.body;
    try {
        await (0, subcategoryModel_1.updateSubCategoryById)(parseInt(id), category_id, name, description, weightage, active);
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subcategory updated successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating subcategory", error));
    }
};
exports.updateSubCategory = updateSubCategory;
// Delete subcategory by ID
const deleteSubCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, subcategoryModel_1.deleteSubCategoryById)(parseInt(id));
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subcategory deleted successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting subcategory", error));
    }
};
exports.deleteSubCategory = deleteSubCategory;
