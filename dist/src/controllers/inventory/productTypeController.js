"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductType = exports.updateProductType = exports.getProductTypeById = exports.addProductType = exports.getProductTypes = void 0;
const productTypeModel_1 = require("../../models/inventory/productTypeModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all product types
const getProductTypes = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm || "";
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "";
    const offset = (page - 1) * limit;
    try {
        const { total, rows } = await (0, productTypeModel_1.getAllProductTypes)(searchTerm, limit, offset, sortField, sortOrder);
        if (!rows || rows.length === 0 || total === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "No product types found"));
        }
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            statusCode: 200,
            message: "Product types fetched successfully",
            data: {
                productTypes: rows,
                totalCount: total,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    }
    catch (error) {
        console.error("Error fetching product types:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching product types", error.message));
    }
};
exports.getProductTypes = getProductTypes;
// Add a new product type
const addProductType = async (req, res) => {
    const { name, weightage, active = true } = req.body;
    try {
        await (0, productTypeModel_1.createProductType)(name, weightage, active);
        return res.status(201).json({
            statusCode: 201,
            message: "Product type created successfully",
            data: null,
        });
    }
    catch (error) {
        console.error("Error creating product type:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating product type", error.message));
    }
};
exports.addProductType = addProductType;
// Get product type by ID
const getProductTypeById = async (req, res) => {
    const productTypeId = Number(req.params.id);
    if (isNaN(productTypeId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid product type ID"));
    }
    try {
        const productType = await (0, productTypeModel_1.getProductTypeById)(productTypeId);
        if (!productType || productType.length === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Product type not found"));
        }
        return res.status(200).json({
            statusCode: 200,
            message: "Product type fetched successfully",
            data: [productType[0]],
        });
    }
    catch (error) {
        console.error("Error fetching product type:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching product type", error.message));
    }
};
exports.getProductTypeById = getProductTypeById;
// Update product type by ID
const updateProductType = async (req, res) => {
    const productTypeId = Number(req.params.id);
    const { name, weightage, active } = req.body;
    if (isNaN(productTypeId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid product type ID"));
    }
    try {
        const result = await (0, productTypeModel_1.updateProductTypeById)(productTypeId, name, weightage, active);
        if (result.affectedRows > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Product type updated successfully",
                data: { productTypeId },
            });
        }
        else {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Product type not found"));
        }
    }
    catch (error) {
        console.error("Error updating product type:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating product type", error.message));
    }
};
exports.updateProductType = updateProductType;
// Delete product type by ID
const deleteProductType = async (req, res) => {
    const productTypeId = Number(req.params.id);
    if (isNaN(productTypeId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid product type ID"));
    }
    try {
        const result = await (0, productTypeModel_1.deleteProductTypeById)(productTypeId);
        if (result.affectedRows > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Product type deleted successfully",
                data: { productTypeId },
            });
        }
        else {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Product type not found"));
        }
    }
    catch (error) {
        console.error("Error deleting product type:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting product type", error.message));
    }
};
exports.deleteProductType = deleteProductType;
