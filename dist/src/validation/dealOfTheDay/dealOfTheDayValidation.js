"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.idValidation = exports.dealValidation = void 0;
const express_validator_1 = require("express-validator");
exports.dealValidation = [
    (0, express_validator_1.body)("food_id").isInt().withMessage("Food ID must be an integer."),
    (0, express_validator_1.body)("unit").isString().withMessage("Unit must be a string."),
    (0, express_validator_1.body)("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
    (0, express_validator_1.body)("offer_price").isFloat({ gt: 0 }).optional().withMessage("Offer Price must be a positive number."),
    (0, express_validator_1.body)("quantity").isInt({ gt: 0 }).withMessage("Quantity must be a positive integer."),
    (0, express_validator_1.body)("description").isString().optional().withMessage("Description must be a string."),
    (0, express_validator_1.body)("status").isInt().withMessage("Status must be an integer."),
    (0, express_validator_1.body)("weightage").isInt().optional().withMessage("Weightage must be an integer."),
];
exports.idValidation = [
    (0, express_validator_1.param)("id").isInt().withMessage("ID must be an integer."),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
