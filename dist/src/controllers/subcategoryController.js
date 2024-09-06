"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubcategory = exports.addSubcategory = exports.getSubcategories = void 0;
const subcategoryModel_1 = require("../models/subcategoryModel");
const responseHandler_1 = require("../utils/responseHandler");
const getSubcategories = async (req, res) => {
    try {
        const subcategories = await (0, subcategoryModel_1.getAllSubcategories)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Subcategories fetched successfully', subcategories));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching subcategories', error));
    }
};
exports.getSubcategories = getSubcategories;
const addSubcategory = async (req, res) => {
    const { name, categoryID, description, weightage, image } = req.body;
    try {
        await (0, subcategoryModel_1.createSubcategory)(name, categoryID, description, weightage, image);
        res.status(201).json((0, responseHandler_1.createResponse)(201, 'Subcategory created successfully'));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error creating subcategory', error));
    }
};
exports.addSubcategory = addSubcategory;
const getSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        const subcategory = await (0, subcategoryModel_1.getSubcategoryById)(parseInt(id));
        if (subcategory.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, 'Subcategory not found'));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, 'Subcategory fetched successfully', subcategory));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching subcategory', error));
    }
};
exports.getSubcategory = getSubcategory;
