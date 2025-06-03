import express from "express";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import {
  getHubOrders,
  getHubOrderSummaryController,
  getOrdersByRoute,
} from "../../controllers/orderAdmin/hubOrderController";

const router = express.Router();

router.get("/", verifyDeviceToken, getHubOrders);
router.get("/route/:routeId", verifyDeviceToken, getOrdersByRoute);
router.get("/summary", verifyDeviceToken, getHubOrderSummaryController);

export default router;
