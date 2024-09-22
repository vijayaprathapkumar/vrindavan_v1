import { body, param, validationResult } from "express-validator";

// Validation rules for creating/updating a customer
export const customerValidation = [
  body("localityId").isInt().withMessage("Locality ID must be an integer"),
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Email is invalid"),
  body("mobile")
    .matches(/^\d{10}$/)
    .withMessage("Mobile number must be 10 digits"),
  body("houseNo")
    .optional()
    .notEmpty()
    .withMessage("House Number cannot be empty if provided"),
  body("completeAddress")
    .notEmpty()
    .withMessage("Complete Address is required"),
  body("status")
    .optional()
    .isIn(["Active", "Inactive", "Follow Up", "Guest"])
    .withMessage("Status is invalid"),
];

// Validation rules for customer ID
export const customerIdValidation = [
  param("id").isInt().withMessage("ID must be an integer"),
];

// Middleware to check for validation errors
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
