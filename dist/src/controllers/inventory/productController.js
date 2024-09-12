"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.addProduct = exports.getProducts = void 0;
const productModel_1 = require("../../models/inventory/productModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all products
const getProducts = async (req, res) => {
    try {
        const products = await (0, productModel_1.getAllProducts)();
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Products fetched successfully", products));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching products", error));
    }
};
exports.getProducts = getProducts;
// Add a new product
const addProduct = async (req, res) => {
    const { name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory, } = req.body;
    try {
        await (0, productModel_1.createProduct)(name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Product created successfully"));
    }
    catch (error) {
        console.error("Error creating product:", error);
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Foreign key constraint fails", error));
        }
        else {
            res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating product", error));
        }
    }
};
exports.addProduct = addProduct;
// Get product by ID
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await (0, productModel_1.getProductById)(Number(id));
        if (product.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Product not found"));
            return;
        }
        res.json((0, responseHandler_1.createResponse)(200, "Product fetched successfully", product[0]));
    }
    catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Database error"));
    }
};
exports.getProductById = getProductById;
// Update product by ID
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory, } = req.body;
    try {
        await (0, productModel_1.updateProductById)(Number(id), name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Product updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating product", error));
    }
};
exports.updateProduct = updateProduct;
// Delete product by ID
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, productModel_1.deleteProductById)(Number(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Product deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting product", error));
    }
};
exports.deleteProduct = deleteProduct;
