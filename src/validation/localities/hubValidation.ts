import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation rules for creating and updating a hub
export const hubValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('route_id').optional().isInt().withMessage('Route ID must be an integer'),
    body('other_details').optional().isString().withMessage('Other details must be a string'),
    body('active').isIn([0, 1]).withMessage('Active status must be 0 or 1'),
];

// Validation rule for hub ID in request parameters
export const hubIdValidation = [
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
