import { Router } from "express";
import {
  cancelOneTimeOrder,
  cancelSubscriptionOrder,
  fetchAllOrders,
  fetchAllOrdersWithOutUserID,
  fetchOrderById,
  getCalender,
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

router.get('/calender/:userId', getCalender);


router.delete('/cancelOneTimeOrder/:orderId', cancelOneTimeOrder);

export default router;
