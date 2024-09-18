"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.subCategoryIdValidation = exports.subCategoryValidation = void 0;
const express_validator_1 = require("express-validator");
const responseHandler_1 = require("../../utils/responseHandler");
// Validation for subcategory fields
exports.subCategoryValidation = [
    (0, express_validator_1.body)("category_id").optional().isNumeric().withMessage("Category ID must be a number"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Subcategory name is required"),
    (0, express_validator_1.body)("weightage").notEmpty().withMessage("Weightage is required"),
    (0, express_validator_1.body)("active").isBoolean().withMessage("Active must be a boolean")
];
// Validation for subcategory ID
exports.subCategoryIdValidation = [
    (0, express_validator_1.param)("id").isNumeric().withMessage("Subcategory ID must be a number")
];
// Middleware to validate request
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Validation error", errors.array()));
    }
    next();
};
exports.validate = validate;
