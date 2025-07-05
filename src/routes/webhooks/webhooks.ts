import express from "express";
import { Request, Response } from "express";
import { razorpayWebhookHandler } from "../../controllers/razorpayWebhook/razorpayWebhook";

const router = express.Router();

// In your router file (webhooks.ts)

router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // This preserves raw body
  (req: Request, res: Response, next: Function) => {
    try {
      // Store raw body for verification
      (req as any).rawBody = req.body.toString();
      next();
    } catch (error) {
      next(error);
    }
  },
  razorpayWebhookHandler
);
export default router;
