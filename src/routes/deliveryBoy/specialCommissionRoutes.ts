import express from "express";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { getDetailedSpecialCommission, getDetailedSpecialCommissions, updateSpecialCommissionController } from "../../controllers/deliveryBoy/specialCommissionController";

const router = express.Router();

// Define routes for special commissions
router.get("/", verifyDeviceToken, getDetailedSpecialCommissions);
router.put("/:commissionId", verifyDeviceToken, updateSpecialCommissionController);
router.get("/:id", verifyDeviceToken, getDetailedSpecialCommission);

export default router;