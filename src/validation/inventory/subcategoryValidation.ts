import { body, param, validationResult } from 'express-validator';

export const subcategoryValidation = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),

  body('categoryID')
    .isInt({ min: 1 })
    .withMessage('CategoryID must be a positive integer')
    .notEmpty()
    .withMessage('CategoryID is required'),

  body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Description is required'),

  body('weightage')
    .isFloat({ min: 0 })
    .withMessage('Weightage must be a non-negative number')
    .notEmpty()
    .withMessage('Weightage is required'),

  body('image')
    .isString()
    .withMessage('Image must be a string')
    .notEmpty()
    .withMessage('Image is required'),
];


export const subcategoryIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('SubcategoryID must be a positive integer'),
];


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
