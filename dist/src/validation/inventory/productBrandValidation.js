"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.brandIdValidation = exports.brandValidation = void 0;
const express_validator_1 = require("express-validator");
exports.brandValidation = [
    (0, express_validator_1.body)('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required'),
];
exports.brandIdValidation = [
    (0, express_validator_1.param)('id')
        .exists()
        .withMessage('Brand ID is required')
        .notEmpty()
        .withMessage('Brand ID cannot be empty')
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
