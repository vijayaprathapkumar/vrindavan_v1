import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "../../config/databaseConnection";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        card_id?: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        amount_refunded?: number;
        refund_status?: string;
        captured: boolean;
        description?: string;
        email?: string;
        contact?: string;
        international: boolean;
        bank?: string;
        wallet?: string;
        vpa?: string;
        notes?: {
          user_id?: string;
        };
        created_at: number;
      };
    };
  };
}

export const razorpayWebhookHandler = async (
  req: Request & { rawBody?: string },
  res: Response,
  next: Function
)  => {
  try {
    console.log("Raw headers:", req.headers); // Debug headers
    console.log("Raw body:", req.rawBody); // Debug raw body

    const signature = req.headers["x-razorpay-signature"] as string;
    
    if (!req.rawBody) {
      console.error("Missing raw body");
      return res.status(400).json({ message: "Missing request body" });
    }

    // Validate signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("❌ Invalid Razorpay webhook signature");
      console.warn("Expected:", expectedSignature);
      console.warn("Received:", signature);
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Parse the body
    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(req.rawBody);
      console.log("Parsed payload:", payload); // Debug parsed payload
    } catch (parseError) {
      console.error("Payload parse error:", parseError);
      return res.status(400).json({ message: "Invalid JSON payload" });
    }

    // Extract payment data with more defensive checks
    const payment = payload?.payload?.payment?.entity;
    if (!payment) {
      console.error("Missing payment data in payload:", payload);
      return res.status(400).json({ message: "Missing payment data" });
    }

    const {
      id: payment_id,
      order_id,
      card_id,
      amount,
      currency,
      status,
      method,
      amount_refunded,
      refund_status,
      captured,
      description,
      email,
      contact,
      international,
      bank,
      wallet,
      vpa,
      notes,
      created_at,
    } = payment;

    const user_id = notes?.user_id || null;

    const insertQuery = `
      INSERT INTO razorpay_webhook_event (
        payment_id, order_id, card_id, user_id,
        amount, currency, status, method, amount_refunded,
        refund_status, captured, description, email, contact,
        international, bank, wallet, vpa, created_at, raw_payload
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db
      .promise()
      .query(insertQuery, [
        payment_id,
        order_id || null,
        card_id || null,
        user_id,
        amount,
        currency,
        status,
        method,
        amount_refunded || 0,
        refund_status || null,
        captured ? 1 : 0,
        description || null,
        email || null,
        contact || null,
        international ? 1 : 0,
        bank || null,
        wallet || null,
        vpa || null,
        new Date(created_at * 1000),
        req.rawBody,
      ]);

    console.log("✅ Webhook verified and data inserted");
    return res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};