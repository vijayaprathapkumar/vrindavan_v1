"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.foodIdValidation = exports.foodValidation = void 0;
const express_validator_1 = require("express-validator");
// Validation rules for food
exports.foodValidation = [
    (0, express_validator_1.body)("name")
        .isString()
        .withMessage("Name must be a string")
        .notEmpty()
        .withMessage("Name is required"),
    (0, express_validator_1.body)("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a non-negative number")
        .notEmpty()
        .withMessage("Price is required"),
    (0, express_validator_1.body)("discount_price")
        .isFloat({ min: 0 })
        .withMessage("Discount Price must be a non-negative number"),
    (0, express_validator_1.body)("description").isString().withMessage("Description must be a string"),
    (0, express_validator_1.body)("perma_link").isString().withMessage("Permanent Link must be a string"),
    (0, express_validator_1.body)("ingredients").isString().withMessage("Ingredients must be a string"),
    (0, express_validator_1.body)("package_items_count")
        .isFloat({ min: 0 })
        .withMessage("Package Items Count must be a non-negative number"),
    (0, express_validator_1.body)("weight")
        .isFloat({ min: 0 })
        .withMessage("Weight must be a non-negative number"),
    (0, express_validator_1.body)("unit").isString().withMessage("Unit must be a string"),
    (0, express_validator_1.body)("sku_code").isString().withMessage("SKU Code must be a string"),
    (0, express_validator_1.body)("barcode").isString().withMessage("Barcode must be a string"),
    (0, express_validator_1.body)("cgst").isString().withMessage("CGST must be a string"),
    (0, express_validator_1.body)("sgst").isString().withMessage("SGST must be a string"),
    (0, express_validator_1.body)("subscription_type")
        .isString()
        .withMessage("Subscription Type must be a string"),
    (0, express_validator_1.body)("track_inventory")
        .isString()
        .withMessage("Track Inventory must be a string"),
    (0, express_validator_1.body)("featured").isBoolean().withMessage("Featured must be a boolean"),
    (0, express_validator_1.body)("deliverable").isBoolean().withMessage("Deliverable must be a boolean"),
    (0, express_validator_1.body)("restaurant_id")
        .isInt({ min: 1 })
        .withMessage("Restaurant ID must be a positive integer")
        .notEmpty()
        .withMessage("Restaurant ID is required"),
    (0, express_validator_1.body)("category_id")
        .isInt({ min: 1 })
        .withMessage("Category ID must be a positive integer")
        .notEmpty()
        .withMessage("Category ID is required"),
    (0, express_validator_1.body)("subcategory_id")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Subcategory ID must be a non-negative integer"),
    (0, express_validator_1.body)("product_type_id")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Product Type ID must be a non-negative integer"),
    (0, express_validator_1.body)("hub_id")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Hub ID must be a non-negative integer"),
    (0, express_validator_1.body)("locality_id")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Locality ID must be a non-negative integer"),
    (0, express_validator_1.body)("product_brand_id")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Product Brand ID must be a non-negative integer"),
    (0, express_validator_1.body)("weightage")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Weightage must be a non-negative integer"),
    (0, express_validator_1.body)("status")
        .isString()
        .withMessage("Status must be a string")
        .notEmpty()
        .withMessage("Status is required"),
    (0, express_validator_1.body)("food_locality")
        .isInt({ min: 0 })
        .withMessage("Food Locality must be a non-negative integer")
        .notEmpty()
        .withMessage("Food Locality is required"),
];
// Validation rule for food ID
exports.foodIdValidation = [
    (0, express_validator_1.param)("id")
        .exists()
        .withMessage("Food ID is required")
        .notEmpty()
        .withMessage("Food ID cannot be empty"),
];
// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
