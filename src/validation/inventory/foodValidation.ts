import { body } from "express-validator";

export const validateFood = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a number greater than 0"),
  body("discount_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount Price must be a non-negative number"),
  body("product_type_id").isInt().withMessage("Product Type must be selected"),
  body("product_brand_id")
    .optional()
    .isInt()
    .withMessage("Product Brand must be selected"),
  body("locality").optional().isString(),
  body("weightage").isString().notEmpty().withMessage("Weightage is required"),
  body("unit_size").isString().notEmpty().withMessage("Unit Size is required"),
  body("sku_code").optional().isString(),
  body("barcode").optional().isString(),
  body("cgst")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("CGST must be a non-negative number"),
  body("sgst")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("SGST must be a non-negative number"),
  body("category_id").isInt().withMessage("Category must be selected"),
  body("subcategory_id").isInt().withMessage("SubCategory must be selected"),
  body("featured").optional().isBoolean(),
  body("subscription").optional().isBoolean(),
  body("track_inventory").optional().isBoolean(),
  body("active").optional().isBoolean(),
];
