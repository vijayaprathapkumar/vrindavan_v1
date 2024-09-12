"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductType = exports.updateProductType = exports.getProductTypeById = exports.addProductType = exports.getProductTypes = void 0;
const productTypeModel_1 = require("../../models/inventory/productTypeModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getProductTypes = async (req, res) => {
    try {
        const productTypes = await (0, productTypeModel_1.getAllProductTypes)();
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Product types fetched successfully", productTypes));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching product types", error));
    }
};
exports.getProductTypes = getProductTypes;
const addProductType = async (req, res) => {
    const { name, weightage } = req.body;
    try {
        await (0, productTypeModel_1.createProductType)(name, weightage);
        res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Product type created successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating product type", error));
    }
};
exports.addProductType = addProductType;
const getProductTypeById = async (req, res) => {
    const { id } = req.params;
    try {
        const productType = await (0, productTypeModel_1.getProductTypeById)(Number(id));
        if (productType.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Product type not found"));
            return;
        }
        res.json((0, responseHandler_1.createResponse)(200, "Product type fetched successfully", productType[0]));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching product type", error));
    }
};
exports.getProductTypeById = getProductTypeById;
const updateProductType = async (req, res) => {
    const { id } = req.params;
    const { name, weightage } = req.body;
    try {
        await (0, productTypeModel_1.updateProductTypeById)(Number(id), name, weightage);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Product type updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating product type", error));
    }
};
exports.updateProductType = updateProductType;
const deleteProductType = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, productTypeModel_1.deleteProductTypeById)(Number(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Product type deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting product type", error));
    }
};
exports.deleteProductType = deleteProductType;
