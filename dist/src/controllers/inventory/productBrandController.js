"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductBrand = exports.updateProductBrand = exports.getProductBrandById = exports.addProductBrand = exports.getProductBrands = void 0;
const productBrandModel_1 = require("../../models/inventory/productBrandModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all product brands
const getProductBrands = async (req, res) => {
    try {
        const brands = await (0, productBrandModel_1.getAllBrands)();
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Product brands fetched successfully", brands));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching product brands", error));
    }
};
exports.getProductBrands = getProductBrands;
// Add a new product brand (POST)
const addProductBrand = async (req, res) => {
    const { name, active } = req.body;
    try {
        await (0, productBrandModel_1.createBrand)(name, active);
        res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Product brand created successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating product brand", error));
    }
};
exports.addProductBrand = addProductBrand;
// Get product brand by ID
const getProductBrandById = async (req, res) => {
    const { id } = req.params;
    try {
        const brand = await (0, productBrandModel_1.getBrandById)(parseInt(id));
        if (brand.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Product brand not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Product brand fetched successfully", brand));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching product brand", error));
    }
};
exports.getProductBrandById = getProductBrandById;
// Update product brand by ID (PUT)
const updateProductBrand = async (req, res) => {
    const { id } = req.params;
    const { name, active } = req.body;
    try {
        await (0, productBrandModel_1.updateBrandById)(parseInt(id), name, active);
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Product brand updated successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating product brand", error));
    }
};
exports.updateProductBrand = updateProductBrand;
// Delete product brand by ID
const deleteProductBrand = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, productBrandModel_1.deleteBrandById)(parseInt(id));
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Product brand deleted successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting product brand", error));
    }
};
exports.deleteProductBrand = deleteProductBrand;
