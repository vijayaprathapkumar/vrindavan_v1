import { Request, Response } from "express";
import {
  verifyOTP,
  saveOTPDetails,
  storeDeviceToken,
  getStoredDeviceToken,
  checkUserProfileStatus, 
} from "../../models/authLogin/authLoginModel";
import { createResponse } from "../../utils/responseHandler";
import { generateDeviceToken } from "../../utils/tokenUtils";
import { generateOTP, sendOTP } from "../../services/msg91";

// Request OTP

export const requestOtp = async (req: Request, res: Response) => {
  const { mobile_number } = req.body;
  const otp = generateOTP();

  try {
    const { user_id, status: userProfileStatus } = await checkUserProfileStatus(mobile_number);

    await sendOTP(mobile_number, otp);
    await saveOTPDetails(mobile_number, otp);

    if (userProfileStatus === 1) {
      res.json(createResponse(200, "OTP sent successfully.", { user_profile: 1, user_id }));
    } else if (userProfileStatus === 0) {
      res.json(createResponse(200, "OTP sent. Profile is incomplete.", { user_profile: 0, user_id }));
    } else {
      res.json(createResponse(200, "OTP sent. User does not exist.", { user_profile: 0, user_id: null }));
    }
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

      res.json(createResponse(200, "OTP verified successfully.",{ device_token }));
    } else {
      res.status(400).json(createResponse(400, "Invalid OTP."));
    }
  } catch (error) {
    if (error.message === "OTP has already been verified.") {
      const existing_device_token = await getStoredDeviceToken(mobile_number);
      res.status(400).json(createResponse(400, "OTP has already been verified.",{ device_token: existing_device_token }));
    } else {
      console.error("Error verifying OTP:", error);
      res.status(500).json(createResponse(500, "Failed to verify OTP."));
    }
  }
};
