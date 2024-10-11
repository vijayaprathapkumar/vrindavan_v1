import express from "express";
import {
  fetchPlaceOrders,
  addPlaceOrderController,
  updatePlaceOrderController,
  removePlaceOrder,
  fetchPlaceOrderById,
} from "../../controllers/placeOrder/placeOrderController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/:userId",verifyDeviceToken, fetchPlaceOrders);
router.get("/byId/:id", verifyDeviceToken, fetchPlaceOrderById);
router.post("/",verifyDeviceToken, addPlaceOrderController);
router.put("/:id",verifyDeviceToken, updatePlaceOrderController);
router.delete("/:id",verifyDeviceToken, removePlaceOrder);

export default router;
