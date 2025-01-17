import express from "express";
import {
  getDetailedCommissions,
  getDetailedCommission,
  updateCommissionController,
} from "../../controllers/deliveryBoy/commissionController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/",verifyDeviceToken, getDetailedCommissions);
router.put("/:commissionId",verifyDeviceToken, updateCommissionController);
router.get("/:id", verifyDeviceToken, getDetailedCommission);

export default router;
