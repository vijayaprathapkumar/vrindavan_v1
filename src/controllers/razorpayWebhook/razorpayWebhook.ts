import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { db } from "../../config/databaseConnection";
import { walletRecharges } from "../wallet/walletTransactionsController";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: any;
    };
  };
}

export const razorpayWebhookHandler = async (
  req: Request & { rawBody?: Buffer },
  res: Response
) => {
  try {
    // 1. Verify webhook signature
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      return res.status(401).json({ error: "Missing signature header" });
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      return res.status(400).json({ error: "Missing raw body" });
    }

    const rawBodyString = rawBody.toString("utf8");
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBodyString)
      .digest("hex");

    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    )) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // 2. Parse payload
    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(rawBodyString);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    const { event, payload: webhookPayload } = payload;
    const payment = webhookPayload?.payment?.entity;
    if (!payment) {
      return res.status(400).json({ error: "Missing payment entity" });
    }

    // 3. Process both authorized and captured payments
    if (event !== "payment.authorized" && event !== "payment.captured") {
      console.log(`ℹ️ Ignoring event: ${event}`);
      return res.status(200).json({ 
        status: "ignored", 
        reason: "Unsupported event type" 
      });
    }

    // 4. Process user info
    const contactRaw = payment.contact || "";
    const contact = contactRaw.startsWith("+91") ? contactRaw.slice(3) : contactRaw;
    const email = payment.email || null;

    let userId: number | null = null;
    if (contact || email) {
      const [rows]: any = await db
        .promise()
        .query("SELECT id FROM users WHERE phone = ? OR email = ?", [contact, email]);
      if (rows.length > 0) {
        userId = rows[0].id;
      }
    }

    if (!userId) {
      return res.status(400).json({ error: "User not found" });
    }

    // 5. Prepare transaction data for walletRecharges
    const amountInRupees = payment.amount / 100;
    const transactionId = `pay_${userId}_${Date.now()}`;
    
    // Get additional data from payment notes
    const paymentNotes = payment.notes || {};
    const planId = paymentNotes.plan_id || null;
    const extraPercentage = paymentNotes.extra_percentage ? 
      parseFloat(paymentNotes.extra_percentage) : 0;
    const planAmount = paymentNotes.plan_amount ? 
      parseFloat(paymentNotes.plan_amount) : amountInRupees;
    const extraAmount = planAmount * (extraPercentage / 100);
    
    // Create a proper mock request object
    const mockRequest = {
      body: {
        transaction_id: transactionId,
        rp_payment_id: payment.id,
        rp_order_id: payment.order_id || null,
        user_id: userId.toString(),
        plan_id: planId,
        extra_percentage: extraPercentage,
        plan_amount: planAmount,
        extra_amount: extraAmount,
        transaction_amount: amountInRupees,
        transaction_type: payment.method || "unknown",
        description: payment.description || `Payment via ${payment.method}`
      }
    } as Request;

    // Call walletRecharges with the prepared data
    await walletRecharges(mockRequest, res);

  } catch (error) {
    console.error("❗ Webhook processing failed:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};