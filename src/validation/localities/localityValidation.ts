import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation rules for creating and updating a locality
export const localityValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('hub_id').optional().isInt().withMessage('Hub ID must be an integer'),
  body('route_id').optional().isInt().withMessage('Route ID must be an integer'),
  body('latitude').optional().isString().withMessage('Latitude must be a string'),
  body('longitude').optional().isString().withMessage('Longitude must be a string'),
  body('active').isIn([0, 1]).withMessage('Active status must be 0 or 1'),
];

// Validation rule for locality ID in request parameters
export const localityIdValidation = [
  param('id').isInt().withMessage('ID must be an integer'),
];

// Middleware to validate the request data against the defined rules
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
