import { body, validationResult } from "express-validator";

export const requestOTPValidation = [
  body("mobile_number")
    .isString()
    .withMessage("Mobile number must be a string")
    .matches(/^\+\d+$/)
    .withMessage("Mobile number must start with a plus sign followed by digits")
    .isLength({ min: 11, max: 15 })
    .withMessage("Mobile number must be between 11 and 15 characters long"),
];

export const verifyOTPValidation = [
  body("mobile_number")
    .isString()
    .withMessage("Mobile number must be a string")
    .matches(/^\+\d+$/)
    .withMessage("Mobile number must start with a plus sign followed by digits")
    .isLength({ min: 11, max: 15 })
    .withMessage("Mobile number must be between 11 and 15 characters long"),
  body("otp")
    .isString()
    .withMessage("OTP must be a string")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits long")
    .matches(/^\d+$/)
    .withMessage("OTP must contain only digits"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
