import express from "express";
import { Request, Response } from "express";
import { razorpayWebhookHandler } from "../../controllers/razorpayWebhook/razorpayWebhook";



// Update your router configuration
const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
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
