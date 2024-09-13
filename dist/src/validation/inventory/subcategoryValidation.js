"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.subCategoryIdValidation = exports.subCategoryValidation = void 0;
const express_validator_1 = require("express-validator");
// Validation rules for subcategory
exports.subCategoryValidation = [
    (0, express_validator_1.body)('category_id')
        .isInt({ gt: 0 })
        .withMessage('Category ID must be a positive integer')
        .notEmpty()
        .withMessage('Category ID is required'),
    (0, express_validator_1.body)('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    (0, express_validator_1.body)('description')
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('weightage')
        .isString()
        .withMessage('Weightage must be a string')
        .notEmpty()
        .withMessage('Weightage is required'),
    (0, express_validator_1.body)('active')
        .isBoolean()
        .withMessage('Active status must be a boolean')
];
// Validation rule for subcategory ID
exports.subCategoryIdValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ gt: 0 })
        .withMessage('Subcategory ID must be a positive integer')
];
// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
