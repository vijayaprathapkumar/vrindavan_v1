"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.categoryIdValidation = exports.categoryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.categoryValidation = [
    (0, express_validator_1.body)('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    (0, express_validator_1.body)('description')
        .isString()
        .withMessage('Description must be a string')
        .notEmpty()
        .withMessage('Description is required'),
    (0, express_validator_1.body)('weightage')
        .isInt({ min: 0 })
        .withMessage('Weightage must be a non-negative integer')
        .notEmpty()
        .withMessage('Weightage is required'),
    (0, express_validator_1.body)('image')
        .isString()
        .withMessage('Image URL must be a string')
        .notEmpty()
        .withMessage('Image URL is required'),
];
exports.categoryIdValidation = [
    (0, express_validator_1.param)('id')
        .exists()
        .withMessage('category ID is required')
        .notEmpty()
        .withMessage('category ID cannot be empty')
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
