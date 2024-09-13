"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.faqCategoryIdValidation = exports.faqCategoryValidation = void 0;
const express_validator_1 = require("express-validator");
exports.faqCategoryValidation = [
    (0, express_validator_1.body)("name")
        .isString()
        .withMessage("Name must be a string")
        .notEmpty()
        .withMessage("Name is required"),
    (0, express_validator_1.body)("weightage")
        .isInt({ min: 0 })
        .withMessage("Weightage must be a non-negative integer")
        .notEmpty()
        .withMessage("Weightage is required"),
];
exports.faqCategoryIdValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 })
        .withMessage("FAQ Category ID must be a positive integer"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
