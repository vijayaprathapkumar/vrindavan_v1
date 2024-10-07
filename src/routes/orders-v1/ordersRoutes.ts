import express from "express";
import {
  fetchOrders,
  updateOrderController,
  removeOrder,
  fetchOrderById, 
} from "../../controllers/orders-v1/ordersController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/:userId",verifyDeviceToken, fetchOrders);
router.get("/by/:id",verifyDeviceToken, fetchOrderById); 
router.put("/:id",verifyDeviceToken, updateOrderController);
router.delete("/:id",verifyDeviceToken, removeOrder); 

export default router;
