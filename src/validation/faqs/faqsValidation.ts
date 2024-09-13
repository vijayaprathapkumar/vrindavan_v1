import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const faqValidation = [
  body("question")
    .isString()
    .withMessage("Question must be a string")
    .notEmpty()
    .withMessage("Question is required"),

  body("answer")
    .isString()
    .withMessage("Answer must be a string")
    .notEmpty()
    .withMessage("Answer is required"),

  body("faqCategoryId")
    .isInt({ gt: 0 })
    .withMessage("FAQ Category ID must be a positive integer")
    .notEmpty()
    .withMessage("FAQ Category ID is required"),

  body("weightage")
    .isInt({ min: 0 })
    .withMessage("Weightage must be a non-negative integer")
    .notEmpty()
    .withMessage("Weightage is required"),
];

export const faqIdValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("FAQ ID must be a positive integer"),
];

export const validate = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
