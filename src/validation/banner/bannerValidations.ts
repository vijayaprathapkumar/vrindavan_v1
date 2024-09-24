import { body, param, validationResult } from "express-validator";

// Validation for creating a new banner
export const validateBanner = [
  body("bannerName").notEmpty().withMessage("Banner name is required."),
  body("bannerType").isInt().withMessage("Banner type must be an integer."),
  body("bannerLocation")
    .isInt()
    .withMessage("Banner location must be an integer."),
  body("status").isInt().withMessage("Status must be an integer."),
  body("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateFrom."),
  body("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateTo."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation for updating a banner
export const validateBannerUpdate = [
  param("id").isInt().withMessage("Invalid banner ID."),
  body("bannerName")
    .optional()
    .notEmpty()
    .withMessage("Banner name is required."),
  body("bannerType")
    .optional()
    .isInt()
    .withMessage("Banner type must be an integer."),
  body("bannerLocation")
    .optional()
    .isInt()
    .withMessage("Banner location must be an integer."),
  body("status").optional().isInt().withMessage("Status must be an integer."),
  body("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateFrom."),
  body("dateTo")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format for dateTo."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
