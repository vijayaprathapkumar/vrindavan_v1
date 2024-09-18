import { body, param, validationResult } from "express-validator";
import { createResponse } from "../../utils/responseHandler";

// Validation for subcategory fields
export const subCategoryValidation = [
  body("category_id").optional().isNumeric().withMessage("Category ID must be a number"),
  body("name").notEmpty().withMessage("Subcategory name is required"),
  body("weightage").notEmpty().withMessage("Weightage is required"),
  body("active").isBoolean().withMessage("Active must be a boolean")
];

// Validation for subcategory ID
export const subCategoryIdValidation = [
  param("id").isNumeric().withMessage("Subcategory ID must be a number")
];

// Middleware to validate request
export const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(createResponse(400, "Validation error", errors.array()));
  }
  next();
};
