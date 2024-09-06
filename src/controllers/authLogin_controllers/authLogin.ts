// src/controllers/loginController.ts
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { generateOTP, sendOTP } from "../../services/authLogin";
import { db } from "../../config/databaseConnection";
import { createResponse } from "../../utils/responseHandler";

export const requestOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { mobile_number } = req.body;

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60000); // OTP expires in 10 minutes

  try {
    db.query(
      "SELECT * FROM users WHERE mobile_number = ?",
      [mobile_number],
      (err: Error | null, result: RowDataPacket[]) => {
        if (err)
          return res.status(500).json(createResponse(500, "Database error"));

        const query =
          result.length === 0
            ? "INSERT INTO users (mobile_number, otp_code, otp_expires_at) VALUES (?, ?, ?)"
            : "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE mobile_number = ?";

        const params =
          result.length === 0
            ? [mobile_number, otp, otpExpiresAt]
            : [otp, otpExpiresAt, mobile_number];

        db.query(query, params, async (err: Error | null) => {
          if (err)
            return res.status(500).json(createResponse(500, "Database error"));

          await sendOTP(mobile_number, otp);
          res.json(createResponse(200, "OTP sent successfully"));
        });
      }
    );
  } catch (error) {
    console.error("Error in requestOTP:", error);
    res.status(500).json(createResponse(500, "Server error"));
  }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { mobile_number, otp } = req.body;

  try {
    db.query(
      "SELECT * FROM users WHERE mobile_number = ? AND otp_code = ? AND otp_expires_at > NOW()",
      [mobile_number, otp],
      (err: Error | null, result: RowDataPacket[]) => {
        if (err)
          return res.status(500).json(createResponse(500, "Database error"));

        if (result.length === 0) {
          return res
            .status(400)
            .json(createResponse(400, "Invalid or expired OTP"));
        }

        res.json(createResponse(200, "OTP verified successfully"));
      }
    );
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json(createResponse(500, "Server error"));
  }
};
