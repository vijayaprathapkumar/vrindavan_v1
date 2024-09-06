import { body, param, validationResult } from 'express-validator';


export const brandValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),
];


export const brandIdValidation = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('Brand ID must be a positive integer'),
];


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
