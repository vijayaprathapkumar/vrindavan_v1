import express from "express";
import { rawBodyMiddleware, razorpayWebhookHandler } from "../../controllers/razorpayWebhook/razorpayWebhook";

const router = express.Router();

// In your router file (webhooks.ts)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // This preserves raw body
  razorpayWebhookHandler // Directly use the handler
);

export default router;
