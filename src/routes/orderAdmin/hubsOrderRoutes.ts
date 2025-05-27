import express from "express";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import {
  getHubOrders,
  getHubOrderSummaryController,
} from "../../controllers/orderAdmin/hubOrderController";

const router = express.Router();

router.get("/", verifyDeviceToken, getHubOrders);
router.get("/summary", verifyDeviceToken, getHubOrderSummaryController);

export default router;
