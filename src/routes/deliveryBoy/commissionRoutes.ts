import express from "express";
import {
  getDetailedCommissions,
  getDetailedCommission,
  addDetailedCommission,
  updateDetailedCommission,
  deleteDetailedCommission,
} from "../../controllers/deliveryBoy/commissionController";
import {
  commissionValidation,
  commissionIdValidation,
  validate,
} from "../../validation/deliveryBoy/commissionValidation";

const router = express.Router();

// Define routes for commissions
router.get("/", getDetailedCommissions);
router.post("/", commissionValidation, validate, addDetailedCommission);
router.get("/:id", commissionIdValidation, validate, getDetailedCommission);
router.put(
  "/:id",
  commissionIdValidation,
  commissionValidation,
  validate,
  updateDetailedCommission
);
router.delete(
  "/:id",
  commissionIdValidation,
  validate,
  deleteDetailedCommission
);

export default router;
