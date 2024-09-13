import { body, param, validationResult } from 'express-validator';

// Validation rules for subcategory
export const subCategoryValidation = [
  body('category_id')
    .isInt({ gt: 0 })
    .withMessage('Category ID must be a positive integer')
    .notEmpty()
    .withMessage('Category ID is required'),

  body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required'),

  body('description')
    .isString()
    .withMessage('Description must be a string'),

  body('weightage')
    .isString()
    .withMessage('Weightage must be a string')
    .notEmpty()
    .withMessage('Weightage is required'),

  body('active')
    .isBoolean()
    .withMessage('Active status must be a boolean')
];

// Validation rule for subcategory ID
export const subCategoryIdValidation = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('Subcategory ID must be a positive integer')
];

// Middleware to handle validation errors
export const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
