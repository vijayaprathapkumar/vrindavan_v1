import { Request, Response } from "express";
import {
  verifyOTP,
  saveOTPDetails,
  storeDeviceToken, 
} from "../../models/authLogin/authLoginModel";
import { createResponse } from "../../utils/responseHandler";
import { generateDeviceToken } from "../../utils/tokenUtils";
import { generateOTP, sendOTP } from "../../services/msg91";

// Request OTP
export const requestOtp = async (req: Request, res: Response) => {
  const { mobile_number } = req.body;
  const otp = generateOTP();

  try {
    await sendOTP(mobile_number, otp);
    await saveOTPDetails(mobile_number, otp);

    res.json(createResponse(200, "OTP sent successfully."));
  } catch (error) {
    console.error("Error requesting OTP:", error);
    res.status(500).json(createResponse(500, "Failed to send OTP."));
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  const { mobile_number, otp } = req.body;

  try {
    const isVerified = await verifyOTP(mobile_number, otp);
    if (isVerified) {

      const device_token = generateDeviceToken();
      await storeDeviceToken(mobile_number, device_token);

      res.json(createResponse(200, "OTP verified successfully."));
    } else {
      res.status(400).json(createResponse(400, "Invalid OTP."));
    }
  } catch (error) {
    if (error.message === "OTP has already been verified.") {
      res.status(400).json(createResponse(400, "OTP has already been verified."));
    } else {
      console.error("Error verifying OTP:", error);
      res.status(500).json(createResponse(500, "Failed to verify OTP."));
    }
  }
};
