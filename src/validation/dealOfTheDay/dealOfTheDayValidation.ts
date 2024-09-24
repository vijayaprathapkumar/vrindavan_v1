import { body, param, validationResult } from "express-validator";

export const dealValidation = [
  body("food_id").isInt().withMessage("Food ID must be an integer."),
  body("unit").isString().withMessage("Unit must be a string."),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
  body("offer_price").isFloat({ gt: 0 }).optional().withMessage("Offer Price must be a positive number."),
  body("quantity").isInt({ gt: 0 }).withMessage("Quantity must be a positive integer."),
  body("description").isString().optional().withMessage("Description must be a string."),
  body("status").isInt().withMessage("Status must be an integer."),
  body("weightage").isInt().optional().withMessage("Weightage must be an integer."),
];

export const idValidation = [
  param("id").isInt().withMessage("ID must be an integer."),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
