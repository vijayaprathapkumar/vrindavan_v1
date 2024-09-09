import { body, param, validationResult } from 'express-validator';

export const productTypeValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),

  body('weightage')
    .isFloat({ min: 0 })
    .withMessage('Weightage must be a non-negative number')
    .notEmpty()
    .withMessage('Weightage is required'),
];


export const productTypeIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ProductTypeID must be a positive integer'),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
