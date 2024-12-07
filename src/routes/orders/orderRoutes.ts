import { Router } from "express";
import {
  fetchAllOrders,
  fetchAllOrdersWithOutUserID,
  fetchOrderById,
  removeOrder,
  updateOrderqty,
} from "../../controllers/orders/orderController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { oneTimeOrdersInCustomer } from "../../controllers/placeOrder/placeOrderController";

const router = Router();

router.post("/oneTimeOrder", verifyDeviceToken, oneTimeOrdersInCustomer);

router.get("/:userId", verifyDeviceToken, fetchAllOrders);

router.get("/", verifyDeviceToken, fetchAllOrdersWithOutUserID);

router.get("/orderId/:id", verifyDeviceToken, fetchOrderById);

router.put("/", verifyDeviceToken, updateOrderqty);

router.delete("/:id", verifyDeviceToken, removeOrder);

export default router;
