import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const commissionValidation = [
  body("monthly_commission_id")
    .isInt({ gt: 0 })
    .withMessage("Monthly Commission ID must be a positive integer")
    .notEmpty()
    .withMessage("Monthly Commission ID is required"),

  body("delivery_boy_id")
    .isInt({ gt: 0 })
    .withMessage("Delivery Boy ID must be a positive integer")
    .notEmpty()
    .withMessage("Delivery Boy ID is required"),

  body("product_id")
    .isInt({ gt: 0 })
    .withMessage("Product ID must be a positive integer")
    .notEmpty()
    .withMessage("Product ID is required"),

  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer")
    .notEmpty()
    .withMessage("Quantity is required"),

  body("commission")
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage("Commission must be a decimal with up to 2 decimal places")
    .notEmpty()
    .withMessage("Commission is required"),

  body("total_commission")
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage("Total Commission must be a decimal with up to 2 decimal places")
    .notEmpty()
    .withMessage("Total Commission is required"),

  body("month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Month must be between 1 and 12")
    .notEmpty()
    .withMessage("Month is required"),

  body("year")
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage("Year must be a valid year")
    .notEmpty()
    .withMessage("Year is required"),
];

export const commissionIdValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Commission ID must be a positive integer"),
];

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};
