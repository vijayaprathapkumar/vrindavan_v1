import { body, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

// Validation for creating/updating orders
export const orderValidation = [
  body('user_id')
    .isInt()
    .withMessage('User ID must be an integer'),

  body('order_type')
    .optional({ nullable: true })
    .isString()
    .withMessage('Order Type must be a string'),

  body('order_date')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage('Order Date must be a valid ISO8601 date'),

  body('tax')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Tax must be a non-negative number'),

  body('delivery_fee')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Delivery Fee must be a non-negative number'),

  body('route_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Route ID must be an integer'),

  body('hub_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Hub ID must be an integer'),

  body('locality_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Locality ID must be an integer'),

  body('delivery_boy_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Delivery Boy ID must be an integer'),

  body('order_status_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Order Status ID must be an integer'),

  body('delivery_address_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Delivery Address ID must be an integer'),

  body('payment_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Payment ID must be an integer'),

  body('is_wallet_deduct')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Is Wallet Deduct must be an integer'),

  body('delivery_status')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Delivery Status must be an integer'),

  body('hint')
    .optional({ nullable: true })
    .isString()
    .withMessage('Hint must be a string'),

  body('active')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Active status must be an integer'),

  body('driver_id')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Driver ID must be an integer'),
];

// Validation for order ID in params
export const orderIdValidation = [
  param('id')
    .isInt({ gt: 0 })
    .withMessage('Order ID must be a positive integer'),
];

// Middleware to handle validation results
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
