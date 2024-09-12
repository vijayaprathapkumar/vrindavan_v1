import { body, param, validationResult } from "express-validator";

export const truckRouteValidation = [
  body("name").notEmpty().withMessage("Route name is required"),
  body("active")
    .isIn(["Active", "Inactive"]).withMessage("Status is invalid"),
];

export const truckRouteIdValidation = [
  param("id").isInt().withMessage("ID must be an integer"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
