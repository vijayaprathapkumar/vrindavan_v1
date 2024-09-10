"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductById = exports.updateProductById = exports.getProductById = exports.createProduct = exports.getAllProducts = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all products
const getAllProducts = async () => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM Products");
    return rows;
};
exports.getAllProducts = getAllProducts;
// Create a new product
const createProduct = async (name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory) => {
    await databaseConnection_1.db.promise().query("INSERT INTO Products (Name, Price, DiscountPrice, Description, ProductTypeID, BrandID, CategoryID, SubcategoryID, Locality, Weightage, Image, UnitSize, SKUCode, Barcode, CGST, SGST, Featured, Subscription, TrackInventory, Active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)", [
        name,
        price,
        discountPrice,
        description,
        productTypeID,
        brandID,
        categoryID,
        subcategoryID,
        locality,
        weightage,
        image,
        unitSize,
        skuCode,
        barcode,
        cgst,
        sgst,
        featured,
        subscription,
        trackInventory
    ]);
};
exports.createProduct = createProduct;
// Get product by ID
const getProductById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM Products WHERE ProductID = ?", [id]);
    return rows;
};
exports.getProductById = getProductById;
// Update product by ID
const updateProductById = async (id, name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory) => {
    await databaseConnection_1.db.promise().query("UPDATE Products SET Name = ?, Price = ?, DiscountPrice = ?, Description = ?, ProductTypeID = ?, BrandID = ?, CategoryID = ?, SubcategoryID = ?, Locality = ?, Weightage = ?, Image = ?, UnitSize = ?, SKUCode = ?, Barcode = ?, CGST = ?, SGST = ?, Featured = ?, Subscription = ?, TrackInventory = ? WHERE ProductID = ?", [
        name,
        price,
        discountPrice,
        description,
        productTypeID,
        brandID,
        categoryID,
        subcategoryID,
        locality,
        weightage,
        image,
        unitSize,
        skuCode,
        barcode,
        cgst,
        sgst,
        featured,
        subscription,
        trackInventory,
        id
    ]);
};
exports.updateProductById = updateProductById;
// Delete product by ID
const deleteProductById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM Products WHERE ProductID = ?", [id]);
};
exports.deleteProductById = deleteProductById;
