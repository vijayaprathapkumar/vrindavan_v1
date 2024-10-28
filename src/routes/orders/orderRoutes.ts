import { Router } from "express";
import {
  fetchAllOrders,
  fetchOrderById,
  removeOrder,
  updateOrderqty,

} from "../../controllers/orders/orderController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = Router();

router.get("/:userId", verifyDeviceToken, fetchAllOrders);

router.get("/byId/:id", verifyDeviceToken, fetchOrderById);

router.put("/", updateOrderqty);

router.delete("/:id", verifyDeviceToken, removeOrder);

export default router;
