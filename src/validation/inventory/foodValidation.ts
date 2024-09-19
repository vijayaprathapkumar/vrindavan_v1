import { body, param, validationResult } from "express-validator";

// Validation rules for food
export const foodValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number")
    .notEmpty()
    .withMessage("Price is required"),

  body("discount_price")
    .isFloat({ min: 0 })
    .withMessage("Discount Price must be a non-negative number"),

  body("description").isString().withMessage("Description must be a string"),

  body("perma_link").isString().withMessage("Permanent Link must be a string"),

  body("ingredients").isString().withMessage("Ingredients must be a string"),

  body("package_items_count")
    .isFloat({ min: 0 })
    .withMessage("Package Items Count must be a non-negative number"),

  body("weight")
    .isFloat({ min: 0 })
    .withMessage("Weight must be a non-negative number"),

  body("unit").isString().withMessage("Unit must be a string"),

  body("sku_code").isString().withMessage("SKU Code must be a string"),

  body("barcode").isString().withMessage("Barcode must be a string"),

  body("cgst").isString().withMessage("CGST must be a string"),

  body("sgst").isString().withMessage("SGST must be a string"),

  body("subscription_type")
    .isString()
    .withMessage("Subscription Type must be a string"),

  body("track_inventory")
    .isString()
    .withMessage("Track Inventory must be a string"),

  body("featured").isBoolean().withMessage("Featured must be a boolean"),

  body("deliverable").isBoolean().withMessage("Deliverable must be a boolean"),

  body("restaurant_id")
    .isInt({ min: 1 })
    .withMessage("Restaurant ID must be a positive integer")
    .notEmpty()
    .withMessage("Restaurant ID is required"),

  body("category_id")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a positive integer")
    .notEmpty()
    .withMessage("Category ID is required"),

  body("subcategory_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Subcategory ID must be a non-negative integer"),

  body("product_type_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Product Type ID must be a non-negative integer"),

  body("hub_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Hub ID must be a non-negative integer"),

  body("locality_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Locality ID must be a non-negative integer"),

  body("product_brand_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Product Brand ID must be a non-negative integer"),

  body("weightage")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Weightage must be a non-negative integer"),

  body("status")
    .isString()
    .withMessage("Status must be a string")
    .notEmpty()
    .withMessage("Status is required"),

  body("food_locality")
    .isInt({ min: 0 })
    .withMessage("Food Locality must be a non-negative integer")
    .notEmpty()
    .withMessage("Food Locality is required"),
];

// Validation rule for food ID
export const foodIdValidation = [
  param("id")
    .exists()
    .withMessage("Food ID is required")
    .notEmpty()
    .withMessage("Food ID cannot be empty"),
];

// Middleware to handle validation errors
export const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
