import express from "express";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { addSpecialCommissionController, getDetailedSpecialCommission, getDetailedSpecialCommissions, updateSpecialCommissionController } from "../../controllers/deliveryBoy/specialCommissionController";

const router = express.Router();

// Define routes for special commissions
router.post("/", verifyDeviceToken, addSpecialCommissionController);
router.get("/", verifyDeviceToken, getDetailedSpecialCommissions);
router.put("/:id", verifyDeviceToken, updateSpecialCommissionController);
router.get("/:id", verifyDeviceToken, getDetailedSpecialCommission);

export default router;