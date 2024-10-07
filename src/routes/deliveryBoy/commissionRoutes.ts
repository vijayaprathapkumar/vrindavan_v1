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
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Define routes for commissions
router.get("/",verifyDeviceToken, getDetailedCommissions);

router.get("/:id", commissionIdValidation,verifyDeviceToken, validate, getDetailedCommission);

export default router;
