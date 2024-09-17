"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.orderIdValidation = exports.orderValidation = void 0;
const express_validator_1 = require("express-validator");
const express_validator_2 = require("express-validator");
// Validation for creating/updating orders
exports.orderValidation = [
    (0, express_validator_1.body)('user_id')
        .isInt()
        .withMessage('User ID must be an integer'),
    (0, express_validator_1.body)('order_type')
        .optional({ nullable: true })
        .isString()
        .withMessage('Order Type must be a string'),
    (0, express_validator_1.body)('order_date')
        .optional({ nullable: true })
        .isISO8601()
        .toDate()
        .withMessage('Order Date must be a valid ISO8601 date'),
    (0, express_validator_1.body)('tax')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Tax must be a non-negative number'),
    (0, express_validator_1.body)('delivery_fee')
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage('Delivery Fee must be a non-negative number'),
    (0, express_validator_1.body)('route_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Route ID must be an integer'),
    (0, express_validator_1.body)('hub_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Hub ID must be an integer'),
    (0, express_validator_1.body)('locality_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Locality ID must be an integer'),
    (0, express_validator_1.body)('delivery_boy_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Delivery Boy ID must be an integer'),
    (0, express_validator_1.body)('order_status_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Order Status ID must be an integer'),
    (0, express_validator_1.body)('delivery_address_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Delivery Address ID must be an integer'),
    (0, express_validator_1.body)('payment_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Payment ID must be an integer'),
    (0, express_validator_1.body)('is_wallet_deduct')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Is Wallet Deduct must be an integer'),
    (0, express_validator_1.body)('delivery_status')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Delivery Status must be an integer'),
    (0, express_validator_1.body)('hint')
        .optional({ nullable: true })
        .isString()
        .withMessage('Hint must be a string'),
    (0, express_validator_1.body)('active')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Active status must be an integer'),
    (0, express_validator_1.body)('driver_id')
        .optional({ nullable: true })
        .isInt()
        .withMessage('Driver ID must be an integer'),
];
// Validation for order ID in params
exports.orderIdValidation = [
    (0, express_validator_1.param)('id')
        .isInt({ gt: 0 })
        .withMessage('Order ID must be a positive integer'),
];
// Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = (0, express_validator_2.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
