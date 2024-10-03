import express from "express";
import {
  fetchOrders,
  updateOrderController,
  removeOrder,
  fetchOrderById, 
} from "../../controllers/orders-v1/ordersController";

const router = express.Router();

router.get("/:userId", fetchOrders);
router.get("/by/:id", fetchOrderById); // GET fetch an order by ID
router.put("/:id", updateOrderController); // PUT update an order
router.delete("/:id", removeOrder); // DELETE an order by ID

export default router;
