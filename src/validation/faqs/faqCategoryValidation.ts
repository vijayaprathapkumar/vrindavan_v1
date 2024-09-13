import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const faqCategoryValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required"),

  body("weightage")
    .isInt({ min: 0 })
    .withMessage("Weightage must be a non-negative integer")
    .notEmpty()
    .withMessage("Weightage is required"),
];

export const faqCategoryIdValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("FAQ Category ID must be a positive integer"),
];

export const validate = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
