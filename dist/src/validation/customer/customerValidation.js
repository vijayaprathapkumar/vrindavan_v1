"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.customerIdValidation = exports.customerValidation = void 0;
const express_validator_1 = require("express-validator");
// Validation rules for creating/updating a customer
exports.customerValidation = [
    (0, express_validator_1.body)("localityId").isInt().withMessage("Locality ID must be an integer"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Email is invalid"),
    (0, express_validator_1.body)("mobile")
        .matches(/^\d{10}$/)
        .withMessage("Mobile number must be 10 digits"),
    (0, express_validator_1.body)("houseNo")
        .optional()
        .notEmpty()
        .withMessage("House Number cannot be empty if provided"),
    (0, express_validator_1.body)("completeAddress").notEmpty().withMessage("Complete Address is required"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn([0, 1])
        .withMessage("Status must be 0 (Inactive) or 1 (Active)"),
];
// Validation rules for customer ID
exports.customerIdValidation = [
    (0, express_validator_1.param)("id").isInt().withMessage("ID must be an integer"),
];
// Middleware to check for validation errors
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
