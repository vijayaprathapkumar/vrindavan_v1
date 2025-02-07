"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.commissionIdValidation = exports.commissionValidation = void 0;
const express_validator_1 = require("express-validator");
exports.commissionValidation = [
    (0, express_validator_1.body)("monthly_commission_id")
        .isInt({ gt: 0 })
        .withMessage("Monthly Commission ID must be a positive integer")
        .notEmpty()
        .withMessage("Monthly Commission ID is required"),
    (0, express_validator_1.body)("delivery_boy_id")
        .isInt({ gt: 0 })
        .withMessage("Delivery Boy ID must be a positive integer")
        .notEmpty()
        .withMessage("Delivery Boy ID is required"),
    (0, express_validator_1.body)("product_id")
        .isInt({ gt: 0 })
        .withMessage("Product ID must be a positive integer")
        .notEmpty()
        .withMessage("Product ID is required"),
    (0, express_validator_1.body)("quantity")
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer")
        .notEmpty()
        .withMessage("Quantity is required"),
    (0, express_validator_1.body)("commission")
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage("Commission must be a decimal with up to 2 decimal places")
        .notEmpty()
        .withMessage("Commission is required"),
    (0, express_validator_1.body)("total_commission")
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage("Total Commission must be a decimal with up to 2 decimal places")
        .notEmpty()
        .withMessage("Total Commission is required"),
    (0, express_validator_1.body)("month")
        .isInt({ min: 1, max: 12 })
        .withMessage("Month must be between 1 and 12")
        .notEmpty()
        .withMessage("Month is required"),
    (0, express_validator_1.body)("year")
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage("Year must be a valid year")
        .notEmpty()
        .withMessage("Year is required"),
];
exports.commissionIdValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 })
        .withMessage("Commission ID must be a positive integer"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }
    else {
        next();
    }
};
exports.validate = validate;
