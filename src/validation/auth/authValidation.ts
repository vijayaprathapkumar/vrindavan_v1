import { body, validationResult } from 'express-validator';

export const requestOTPValidation = [
  body('mobile_number').isMobilePhone('any').withMessage('Invalid mobile number'),
];

export const verifyOTPValidation = [
  body('mobile_number').isMobilePhone('any').withMessage('Invalid mobile number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
