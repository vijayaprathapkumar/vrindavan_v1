"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBannerUpdate = exports.validateBanner = void 0;
const express_validator_1 = require("express-validator");
// Validation for creating a new banner
exports.validateBanner = [
    (0, express_validator_1.body)("bannerName").notEmpty().withMessage("Banner name is required."),
    (0, express_validator_1.body)("bannerType").isInt().withMessage("Banner type must be an integer."),
    (0, express_validator_1.body)("bannerLocation")
        .isInt()
        .withMessage("Banner location must be an integer."),
    (0, express_validator_1.body)("status").isInt().withMessage("Status must be an integer."),
    (0, express_validator_1.body)("dateFrom")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format for dateFrom."),
    (0, express_validator_1.body)("dateTo")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format for dateTo."),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
// Validation for updating a banner
exports.validateBannerUpdate = [
    (0, express_validator_1.param)("id").isInt().withMessage("Invalid banner ID."),
    (0, express_validator_1.body)("bannerName")
        .optional()
        .notEmpty()
        .withMessage("Banner name is required."),
    (0, express_validator_1.body)("bannerType")
        .optional()
        .isInt()
        .withMessage("Banner type must be an integer."),
    (0, express_validator_1.body)("bannerLocation")
        .optional()
        .isInt()
        .withMessage("Banner location must be an integer."),
    (0, express_validator_1.body)("status").optional().isInt().withMessage("Status must be an integer."),
    (0, express_validator_1.body)("dateFrom")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format for dateFrom."),
    (0, express_validator_1.body)("dateTo")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format for dateTo."),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];
