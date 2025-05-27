import { Router } from "express";
import { fetchDeliveryBoyOrders, fetchDeliveryBoyOrderSummary } from "../../controllers/orderAdmin/deliveryBoyOrdersController";

const router = Router();

router.get("/", fetchDeliveryBoyOrders);
router.get("/summary", fetchDeliveryBoyOrderSummary);


export default router;
