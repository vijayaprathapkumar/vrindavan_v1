import { Router } from "express";
import {
  cancelSubscriptionOrder,
  fetchAllOrders,
  fetchAllOrdersWithOutUserID,
  fetchOrderById,
  getUpcomingOrders,
  removeOrder,
  updateOrderQty,
} from "../../controllers/orders/orderController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { oneTimeOrdersInCustomer } from "../../controllers/placeOrder/placeOrderController";

const router = Router();

router.post("/oneTimeOrder", verifyDeviceToken, oneTimeOrdersInCustomer);
router.post("/oneSubscriptionOrder", verifyDeviceToken, oneTimeOrdersInCustomer);

router.get("/:userId", verifyDeviceToken, fetchAllOrders);

router.get("/", verifyDeviceToken, fetchAllOrdersWithOutUserID);

router.get("/orderId/:id", verifyDeviceToken, fetchOrderById);

router.put("/", verifyDeviceToken, updateOrderQty);

router.delete("/:id", verifyDeviceToken, removeOrder);


router.put('/cancel-order', cancelSubscriptionOrder);

router.get('/upcoming/:id', getUpcomingOrders);


export default router;
