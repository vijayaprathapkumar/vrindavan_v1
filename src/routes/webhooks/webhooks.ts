import express from "express";
import { razorpayWebhookHandler } from "../../models/razorpayWebhook/razorpayWebhook";

const router = express.Router();

// Important: Use raw body parser middleware
router.post("/razorpay", express.raw({ type: "application/json" }), razorpayWebhookHandler);

export default router;
