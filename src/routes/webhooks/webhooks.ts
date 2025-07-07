import express from "express";
import { razorpayWebhookHandler } from "../../controllers/razorpayWebhook/razorpayWebhook";

const router = express.Router();

// Middleware to attach rawBody
router.post(
  "/",
  (req, res, next) => {
    express.raw({ type: "application/json" })(req, res, (err) => {
      if (err) return next(err);
      (req as any).rawBody = req.body; // raw buffer
      next();
    });
  },
  razorpayWebhookHandler
);

export default router;
