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
  .exists()
  .withMessage('Brand ID is required')
  .notEmpty()
  .withMessage('Brand ID cannot be empty')
];


export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
