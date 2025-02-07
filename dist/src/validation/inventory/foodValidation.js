"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFood = void 0;
const express_validator_1 = require("express-validator");
exports.validateFood = [
    (0, express_validator_1.body)("name").isString().notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("price")
        .isFloat({ gt: 0 })
        .withMessage("Price must be a number greater than 0"),
    (0, express_validator_1.body)("discount_price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Discount Price must be a non-negative number"),
    (0, express_validator_1.body)("product_type_id").isInt().withMessage("Product Type must be selected"),
    (0, express_validator_1.body)("product_brand_id")
        .optional()
        .isInt()
        .withMessage("Product Brand must be selected"),
    (0, express_validator_1.body)("locality").optional().isString(),
    (0, express_validator_1.body)("weightage").isString().notEmpty().withMessage("Weightage is required"),
    (0, express_validator_1.body)("unit_size").isString().notEmpty().withMessage("Unit Size is required"),
    (0, express_validator_1.body)("sku_code").optional().isString(),
    (0, express_validator_1.body)("barcode").optional().isString(),
    (0, express_validator_1.body)("cgst")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("CGST must be a non-negative number"),
    (0, express_validator_1.body)("sgst")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("SGST must be a non-negative number"),
    (0, express_validator_1.body)("category_id").isInt().withMessage("Category must be selected"),
    (0, express_validator_1.body)("subcategory_id").isInt().withMessage("SubCategory must be selected"),
    (0, express_validator_1.body)("featured").optional().isBoolean(),
    (0, express_validator_1.body)("subscription").optional().isBoolean(),
    (0, express_validator_1.body)("track_inventory").optional().isBoolean(),
    (0, express_validator_1.body)("active").optional().isBoolean(),
];
