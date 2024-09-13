// validation/localities/localityValidation.ts

import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const localityValidation = [
  body('address').notEmpty().withMessage('Address is required'),
  body('active').isBoolean().withMessage('Active must be a boolean'),
];

export const localityIdValidation = [
  param('id').isInt().withMessage('ID must be an integer'),
];

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
