"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.verifyOTPValidation = exports.requestOTPValidation = void 0;
const express_validator_1 = require("express-validator");
exports.requestOTPValidation = [
    (0, express_validator_1.body)('mobile_number').isMobilePhone('any').withMessage('Invalid mobile number'),
];
exports.verifyOTPValidation = [
    (0, express_validator_1.body)('mobile_number').isMobilePhone('any').withMessage('Invalid mobile number'),
    (0, express_validator_1.body)('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
