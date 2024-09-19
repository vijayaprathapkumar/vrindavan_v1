"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.productTypeIdValidation = exports.productTypeValidation = void 0;
const express_validator_1 = require("express-validator");
exports.productTypeValidation = [
    (0, express_validator_1.body)('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
    (0, express_validator_1.body)('weightage')
        .isFloat({ min: 0 })
        .withMessage('Weightage must be a non-negative number')
        .notEmpty()
        .withMessage('Weightage is required'),
];
exports.productTypeIdValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ProductTypeID must be a positive integer'),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
