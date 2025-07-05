import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "../../config/databaseConnection";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

export const razorpayWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;

  const bodyBuffer = req.body; // raw buffer
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(bodyBuffer)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ status: "error", message: "Invalid signature" });
  }

  const parsedBody = JSON.parse(bodyBuffer.toString());
  const event = parsedBody.event;
  const payment = parsedBody.payload.payment?.entity;

  if (!payment) {
    return res.status(400).json({ message: "Missing payment data" });
  }

  try {
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

    await db.promise().query(insertQuery, [
      payment_id,
      order_id,
      card_id,
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
      new Date(created_at * 1000), // Convert UNIX timestamp
      JSON.stringify(parsedBody),
    ]);

    return res.status(200).json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook DB Insert Error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
