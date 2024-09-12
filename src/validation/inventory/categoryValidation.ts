import { body, param, validationResult } from 'express-validator';

export const categoryValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),

  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Description is required'),

  body('weightage')
    .isInt({ min: 0 })
    .withMessage('Weightage must be a non-negative integer')
    .notEmpty()
    .withMessage('Weightage is required'),

  body('image')
    .isString()
    .withMessage('Image URL must be a string')
    .notEmpty()
    .withMessage('Image URL is required'),
];

export const categoryIdValidation = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('Category ID must be a positive integer'),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
