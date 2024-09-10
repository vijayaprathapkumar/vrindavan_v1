"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.subcategoryIdValidation = exports.subcategoryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.subcategoryValidation = [
    (0, express_validator_1.body)('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    (0, express_validator_1.body)('categoryID')
        .isInt({ min: 1 })
        .withMessage('CategoryID must be a positive integer')
        .notEmpty()
        .withMessage('CategoryID is required'),
    (0, express_validator_1.body)('description')
        .isString()
        .withMessage('Description must be a string')
        .notEmpty()
        .withMessage('Description is required'),
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
];
exports.subcategoryIdValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('SubcategoryID must be a positive integer'),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
