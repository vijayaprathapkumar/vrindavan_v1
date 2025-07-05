// src/routes/webhooks.ts
import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
import { razorpayWebhookHandler } from "../../models/razorpayWebhook/razorpayWebhook";

const router = express.Router();

// Apply raw parser only for this webhook
router.post(
  "/razorpay/webhook",
  bodyParser.raw({ type: "application/json" }), // <- Required
  razorpayWebhookHandler
);

export default router;
