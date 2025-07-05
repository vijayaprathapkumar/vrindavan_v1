import express from "express";
import { rawBodyMiddleware, razorpayWebhookHandler } from "../../controllers/razorpayWebhook/razorpayWebhook";

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  rawBodyMiddleware,
  razorpayWebhookHandler
);

export default router;
