import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../config/databaseConnection';

// Validate environment variable at startup
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
}

interface PaymentEntity {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  captured: boolean;
  international: boolean;
  created_at: number;
  card_id?: string;
  amount_refunded?: number;
  refund_status?: string;
  description?: string;
  email?: string;
  contact?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  notes?: {
    user_id?: string;
  };
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: PaymentEntity;
    };
  };
}

export const razorpayWebhookHandler = async (
  req: Request & { rawBody?: Buffer },
  res: Response
) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      console.error("Missing Razorpay signature header");
      return res.status(401).json({ error: "Missing signature header" });
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      console.error("Missing raw body");
      return res.status(400).json({ error: "Missing raw body" });
    }

    const rawBodyString = rawBody.toString("utf8");
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret!)
      .update(rawBodyString)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      console.error("Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Safe to parse now
    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(rawBodyString);
    } catch (err) {
      console.error("Invalid JSON payload", err);
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    const payment = payload.payload.payment.entity;

    const insertQuery = `
      INSERT INTO razorpay_webhook_event (
        payment_id, order_id, card_id, user_id,
        amount, currency, status, method, amount_refunded,
        refund_status, captured, description, email, contact,
        international, bank, wallet, vpa, created_at, raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      payment.id,
      payment.order_id || null,
      payment.card_id || null,
      payment.notes?.user_id || null,
      payment.amount,
      payment.currency,
      payment.status,
      payment.method,
      payment.amount_refunded || 0,
      payment.refund_status || null,
      payment.captured ? 1 : 0,
      payment.description || null,
      payment.email || null,
      payment.contact || null,
      payment.international ? 1 : 0,
      payment.bank || null,
      payment.wallet || null,
      payment.vpa || null,
      new Date(payment.created_at * 1000),
      rawBodyString
    ];

    await db.promise().query(insertQuery, params);
    console.log("✅ Webhook processed for payment:", payment.id);
    return res.status(200).json({ status: "success" });

  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
