import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const deliveryBoyValidation = [
  body("userId")
    .isInt({ gt: 0 })
    .withMessage("User ID must be a positive integer")
    .notEmpty()
    .withMessage("User ID is required"),

  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string"),

  body("mobile")
    .optional()
    .isString()
    .withMessage("Mobile must be a string"),

  body("active")
    .isBoolean()
    .withMessage("Active must be a boolean"),

  body("cashCollection")
    .isBoolean()
    .withMessage("Cash Collection must be a boolean"),

  body("deliveryFee")
    .isFloat({ min: 0 })
    .withMessage("Delivery Fee must be a non-negative number"),

  body("totalOrders")
    .isInt({ min: 0 })
    .withMessage("Total Orders must be a non-negative integer"),

  body("earning")
    .isFloat({ min: 0 })
    .withMessage("Earning must be a non-negative number"),

  body("available")
    .isBoolean()
    .withMessage("Available must be a boolean"),

  body("addressPickup")
    .optional()
    .isString()
    .withMessage("Address Pickup must be a string"),

  body("latitudePickup")
    .optional()
    .isString()
    .withMessage("Latitude Pickup must be a string"),

  body("longitudePickup")
    .optional()
    .isString()
    .withMessage("Longitude Pickup must be a string"),
];

export const deliveryBoyIdValidation = [
  param("id")
    .isInt({ gt: 0 })
    .withMessage("Delivery Boy ID must be a positive integer"),
];

export const validate = (req: Request, res: Response, next: NextFunction): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
