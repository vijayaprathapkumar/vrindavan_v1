import express from "express";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { getLocalityOrders, getLocalityOrderSummary } from "../../controllers/orderAdmin/localityOrderController";


const router = express.Router();

router.get("/", verifyDeviceToken, getLocalityOrders);
router.get("/summary", verifyDeviceToken, getLocalityOrderSummary);

export default router;