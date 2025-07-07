import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "../../config/databaseConnection";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
}

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
      .createHmac("sha256", webhookSecret!)
      .update(rawBodyString)
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Parse payload safely
    let payload: RazorpayWebhookPayload;
    try {
      payload = JSON.parse(rawBodyString);
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    const payment = payload.payload.payment.entity;

    // 👇 Extract phone from contact (remove +91)
    const contactRaw = payment.contact || "";
    const contact = contactRaw.startsWith("+91")
      ? contactRaw.slice(3)
      : contactRaw;

    // 👇 Find user by phone number
    let userId: number | null = null;
    if (contact) {
      const [rows]: any = await db
        .promise()
        .query("SELECT id FROM users WHERE phone = ?", [contact]);

      if (Array.isArray(rows) && rows.length > 0) {
        userId = rows[0].id;
      }
    }

    // 👇 Convert amount to rupees for storage/display if needed
    const amountInRupees = payment.amount / 100;

    // 👇 Insert into webhook table
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
      userId,
      payment.amount,
      payment.currency,
      payment.status,
      payment.method,
      payment.amount_refunded || 0,
      payment.refund_status || null,
      payment.captured ? 1 : 0,
      payment.description || null,
      payment.email || null,
      contact,
      payment.international ? 1 : 0,
      payment.bank || null,
      payment.wallet || null,
      payment.vpa || null,
      new Date(payment.created_at * 1000),
      rawBodyString,
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
