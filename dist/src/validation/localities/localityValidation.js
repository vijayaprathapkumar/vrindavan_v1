"use strict";
// validation/localities/localityValidation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.localityIdValidation = exports.localityValidation = void 0;
const express_validator_1 = require("express-validator");
exports.localityValidation = [
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('active').isBoolean().withMessage('Active must be a boolean'),
];
exports.localityIdValidation = [
    (0, express_validator_1.param)('id').isInt().withMessage('ID must be an integer'),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
