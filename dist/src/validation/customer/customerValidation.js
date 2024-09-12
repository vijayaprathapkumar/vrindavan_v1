"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.customerIdValidation = exports.customerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.customerValidation = [
    (0, express_validator_1.body)("locality").notEmpty().withMessage("Locality is required"),
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Email is invalid"),
    (0, express_validator_1.body)("mobile")
        .isMobilePhone(["en-IN", "en-US"])
        .withMessage("Mobile number is invalid"),
    (0, express_validator_1.body)("complete_address")
        .notEmpty()
        .withMessage("Complete Address is required"),
    (0, express_validator_1.body)("status")
        .isIn(["Active", "Inactive", "Follow up", "Guest"])
        .withMessage("Status is invalid"),
];
exports.customerIdValidation = [
    (0, express_validator_1.param)("id").isInt().withMessage("ID must be an integer"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
