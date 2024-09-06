"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProductType = exports.getProductTypes = void 0;
const productTypeModel_1 = require("../models/productTypeModel");
const responseHandler_1 = require("../utils/responseHandler");
const getProductTypes = async (req, res) => {
    try {
        const productTypes = await (0, productTypeModel_1.getAllProductTypes)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Product types fetched successfully', productTypes));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching product types', error));
    }
};
exports.getProductTypes = getProductTypes;
const addProductType = async (req, res) => {
    const { name, weightage } = req.body;
    try {
        await (0, productTypeModel_1.createProductType)(name, weightage);
        res.status(201).json((0, responseHandler_1.createResponse)(201, 'Product type created successfully'));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error creating product type', error));
    }
};
exports.addProductType = addProductType;
