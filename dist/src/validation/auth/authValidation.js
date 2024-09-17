"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.verifyOTPValidation = exports.requestOTPValidation = void 0;
const express_validator_1 = require("express-validator");
exports.requestOTPValidation = [
    (0, express_validator_1.body)("mobile_number")
        .isString()
        .withMessage("Mobile number must be a string")
        .matches(/^\+\d+$/)
        .withMessage("Mobile number must start with a plus sign followed by digits")
        .isLength({ min: 11, max: 15 })
        .withMessage("Mobile number must be between 11 and 15 characters long"),
];
exports.verifyOTPValidation = [
    (0, express_validator_1.body)("mobile_number")
        .isString()
        .withMessage("Mobile number must be a string")
        .matches(/^\+\d+$/)
        .withMessage("Mobile number must start with a plus sign followed by digits")
        .isLength({ min: 11, max: 15 })
        .withMessage("Mobile number must be between 11 and 15 characters long"),
    (0, express_validator_1.body)("otp")
        .isString()
        .withMessage("OTP must be a string")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits long")
        .matches(/^\d+$/)
        .withMessage("OTP must contain only digits"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
