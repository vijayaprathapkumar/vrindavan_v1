"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.deliveryBoyIdValidation = exports.deliveryBoyValidation = void 0;
const express_validator_1 = require("express-validator");
exports.deliveryBoyValidation = [
    (0, express_validator_1.body)("userId")
        .isInt({ gt: 0 })
        .withMessage("User ID must be a positive integer")
        .notEmpty()
        .withMessage("User ID is required"),
    (0, express_validator_1.body)("name")
        .optional()
        .isString()
        .withMessage("Name must be a string"),
    (0, express_validator_1.body)("mobile")
        .optional()
        .isString()
        .withMessage("Mobile must be a string"),
    (0, express_validator_1.body)("active")
        .isBoolean()
        .withMessage("Active must be a boolean"),
    (0, express_validator_1.body)("cashCollection")
        .isBoolean()
        .withMessage("Cash Collection must be a boolean"),
    (0, express_validator_1.body)("deliveryFee")
        .isFloat({ min: 0 })
        .withMessage("Delivery Fee must be a non-negative number"),
    (0, express_validator_1.body)("totalOrders")
        .isInt({ min: 0 })
        .withMessage("Total Orders must be a non-negative integer"),
    (0, express_validator_1.body)("earning")
        .isFloat({ min: 0 })
        .withMessage("Earning must be a non-negative number"),
    (0, express_validator_1.body)("available")
        .isBoolean()
        .withMessage("Available must be a boolean"),
    (0, express_validator_1.body)("addressPickup")
        .optional()
        .isString()
        .withMessage("Address Pickup must be a string"),
    (0, express_validator_1.body)("latitudePickup")
        .optional()
        .isString()
        .withMessage("Latitude Pickup must be a string"),
    (0, express_validator_1.body)("longitudePickup")
        .optional()
        .isString()
        .withMessage("Longitude Pickup must be a string"),
];
exports.deliveryBoyIdValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 })
        .withMessage("Delivery Boy ID must be a positive integer"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
