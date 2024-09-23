import express from "express";
import {
  getDetailedCommissions,
  getDetailedCommission,
} from "../../controllers/deliveryBoy/commissionController";
import {
  commissionValidation,
  commissionIdValidation,
  validate,
} from "../../validation/deliveryBoy/commissionValidation";

const router = express.Router();

// Define routes for commissions
router.get("/", getDetailedCommissions);

router.get("/:id", commissionIdValidation, validate, getDetailedCommission);

export default router;
