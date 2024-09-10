"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.productIdValidation = exports.productValidation = void 0;
const express_validator_1 = require("express-validator");
exports.productValidation = [
    (0, express_validator_1.body)('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    (0, express_validator_1.body)('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number')
        .notEmpty()
        .withMessage('Price is required'),
    (0, express_validator_1.body)('discountPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount Price must be a non-negative number'),
    (0, express_validator_1.body)('description')
        .isString()
        .withMessage('Description must be a string')
        .notEmpty()
        .withMessage('Description is required'),
    (0, express_validator_1.body)('productTypeID')
        .isInt({ min: 1 })
        .withMessage('ProductTypeID must be a positive integer')
        .notEmpty()
        .withMessage('ProductTypeID is required'),
    (0, express_validator_1.body)('brandID')
        .isInt({ min: 1 })
        .withMessage('BrandID must be a positive integer')
        .notEmpty()
        .withMessage('BrandID is required'),
    (0, express_validator_1.body)('categoryID')
        .isInt({ min: 1 })
        .withMessage('CategoryID must be a positive integer')
        .notEmpty()
        .withMessage('CategoryID is required'),
    (0, express_validator_1.body)('subcategoryID')
        .isInt({ min: 1 })
        .withMessage('SubcategoryID must be a positive integer')
        .notEmpty()
        .withMessage('SubcategoryID is required'),
    (0, express_validator_1.body)('locality')
        .isString()
        .withMessage('Locality must be a string')
        .notEmpty()
        .withMessage('Locality is required'),
    (0, express_validator_1.body)('weightage')
        .isFloat({ min: 0 })
        .withMessage('Weightage must be a non-negative number')
        .notEmpty()
        .withMessage('Weightage is required'),
    (0, express_validator_1.body)('image')
        .isString()
        .withMessage('Image must be a string')
        .notEmpty()
        .withMessage('Image is required'),
    (0, express_validator_1.body)('unitSize')
        .isString()
        .withMessage('UnitSize must be a string')
        .notEmpty()
        .withMessage('UnitSize is required'),
    (0, express_validator_1.body)('skuCode')
        .isString()
        .withMessage('SKUCode must be a string')
        .notEmpty()
        .withMessage('SKUCode is required'),
    (0, express_validator_1.body)('barcode')
        .isString()
        .withMessage('Barcode must be a string')
        .notEmpty()
        .withMessage('Barcode is required'),
    (0, express_validator_1.body)('cgst')
        .isFloat({ min: 0 })
        .withMessage('CGST must be a non-negative number')
        .notEmpty()
        .withMessage('CGST is required'),
    (0, express_validator_1.body)('sgst')
        .isFloat({ min: 0 })
        .withMessage('SGST must be a non-negative number')
        .notEmpty()
        .withMessage('SGST is required'),
    (0, express_validator_1.body)('featured')
        .isBoolean()
        .withMessage('Featured must be a boolean')
        .notEmpty()
        .withMessage('Featured is required'),
    (0, express_validator_1.body)('subscription')
        .isBoolean()
        .withMessage('Subscription must be a boolean')
        .notEmpty()
        .withMessage('Subscription is required'),
    (0, express_validator_1.body)('trackInventory')
        .isBoolean()
        .withMessage('TrackInventory must be a boolean')
        .notEmpty()
        .withMessage('TrackInventory is required'),
];
exports.productIdValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ProductID must be a positive integer'),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
