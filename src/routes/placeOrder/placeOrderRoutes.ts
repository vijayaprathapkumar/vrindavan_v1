import express from "express";
import {
  fetchPlaceOrders,
  placeOneTimeOrder,
  updateOneTimeOrder,
  removePlaceOrder,
  fetchPlaceOrderById,
} from "../../controllers/placeOrder/placeOrderController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.get("/:userId",verifyDeviceToken, fetchPlaceOrders);
router.get("/byId/:id", verifyDeviceToken, fetchPlaceOrderById);
router.post("/",verifyDeviceToken, placeOneTimeOrder);
router.put("/:id",verifyDeviceToken, updateOneTimeOrder);
router.delete("/:id",verifyDeviceToken, removePlaceOrder);

export default router;
