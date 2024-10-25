import express from "express";
import { placeOneTimeOrder } from "../../controllers/placeOrder/placeOrderController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

router.post("/", verifyDeviceToken, placeOneTimeOrder);

export default router;
