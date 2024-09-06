"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductById = exports.createProduct = exports.getAllProducts = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const getAllProducts = async () => {
    const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM Products');
    return rows;
};
exports.getAllProducts = getAllProducts;
const createProduct = async (name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory) => {
    await databaseConnection_1.db.promise().query('INSERT INTO Products (Name, Price, DiscountPrice, Description, ProductTypeID, BrandID, CategoryID, SubcategoryID, Locality, Weightage, Image, UnitSize, SKUCode, Barcode, CGST, SGST, Featured, Subscription, TrackInventory, Active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)', [name, price, discountPrice, description, productTypeID, brandID, categoryID, subcategoryID, locality, weightage, image, unitSize, skuCode, barcode, cgst, sgst, featured, subscription, trackInventory]);
};
exports.createProduct = createProduct;
const getProductById = async (id) => {
    try {
        const [rows] = await databaseConnection_1.db.promise().query('SELECT * FROM Products WHERE ProductID = ?', [id]);
        return rows;
    }
    catch (error) {
        throw new Error('Error fetching product by ID');
    }
};
exports.getProductById = getProductById;
