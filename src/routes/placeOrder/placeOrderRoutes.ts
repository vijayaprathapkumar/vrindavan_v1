import express from "express";
import {
  fetchPlaceOrders,
  addPlaceOrderController,
  updatePlaceOrderController,
  removePlaceOrder,
} from "../../controllers/placeOrder/placeOrderController";

const router = express.Router();

router.get("/:userId", fetchPlaceOrders);
router.post("/", addPlaceOrderController);
router.put("/:id", updatePlaceOrderController);
router.delete("/:id", removePlaceOrder);

export default router;
