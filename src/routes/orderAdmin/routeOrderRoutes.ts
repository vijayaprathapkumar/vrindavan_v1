import express from "express";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import {
  getFoodOrders,
  getFoodOrderSummaryController,
} from "../../controllers/orderAdmin/routeOrderController";

const router = express.Router();

router.get("/", verifyDeviceToken, getFoodOrders);
router.get("/summary", verifyDeviceToken, getFoodOrderSummaryController);
export default router;
