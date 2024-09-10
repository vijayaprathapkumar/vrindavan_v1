import { body, param, validationResult } from "express-validator";

export const customerValidation = [
  body("locality").notEmpty().withMessage("Locality is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Email is invalid"),

  body("mobile")
    .isMobilePhone(["en-IN", "en-US"])
    .withMessage("Mobile number is invalid"),

  body("complete_address")
    .notEmpty()
    .withMessage("Complete Address is required"),
  body("status")
    .isIn(["Active", "Inactive", "Follow up", "Guest"])
    .withMessage("Status is invalid"),
];

export const customerIdValidation = [
  param("id").isInt().withMessage("ID must be an integer"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
