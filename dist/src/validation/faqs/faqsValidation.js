"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.faqIdValidation = exports.faqValidation = void 0;
const express_validator_1 = require("express-validator");
exports.faqValidation = [
    (0, express_validator_1.body)("question")
        .isString()
        .withMessage("Question must be a string")
        .notEmpty()
        .withMessage("Question is required"),
    (0, express_validator_1.body)("answer")
        .isString()
        .withMessage("Answer must be a string")
        .notEmpty()
        .withMessage("Answer is required"),
    (0, express_validator_1.body)("faqCategoryId")
        .isInt({ gt: 0 })
        .withMessage("FAQ Category ID must be a positive integer")
        .notEmpty()
        .withMessage("FAQ Category ID is required"),
    (0, express_validator_1.body)("weightage")
        .isInt({ min: 0 })
        .withMessage("Weightage must be a non-negative integer")
        .notEmpty()
        .withMessage("Weightage is required"),
];
exports.faqIdValidation = [
    (0, express_validator_1.param)("id")
        .isInt({ gt: 0 })
        .withMessage("FAQ ID must be a positive integer"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
