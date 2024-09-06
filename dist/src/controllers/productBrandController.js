"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProductBrand = exports.getProductBrands = void 0;
const productBrandModel_1 = require("../models/productBrandModel");
const responseHandler_1 = require("../utils/responseHandler");
const getProductBrands = async (req, res) => {
    try {
        const brands = await (0, productBrandModel_1.getAllBrands)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Product brands fetched successfully', brands));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching product brands', error));
    }
};
exports.getProductBrands = getProductBrands;
const addProductBrand = async (req, res) => {
    const { name } = req.body;
    try {
        await (0, productBrandModel_1.createBrand)(name);
        res.status(201).json((0, responseHandler_1.createResponse)(201, 'Product brand created successfully'));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error creating product brand', error));
    }
};
exports.addProductBrand = addProductBrand;
