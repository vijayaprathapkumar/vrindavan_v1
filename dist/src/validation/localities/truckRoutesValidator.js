"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.truckRouteIdValidation = exports.truckRouteValidation = void 0;
const express_validator_1 = require("express-validator");
exports.truckRouteValidation = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Route name is required"),
    (0, express_validator_1.body)("active")
        .isIn(["Active", "Inactive"]).withMessage("Status is invalid"),
];
exports.truckRouteIdValidation = [
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
