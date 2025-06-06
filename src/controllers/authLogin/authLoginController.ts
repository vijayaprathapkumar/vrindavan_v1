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
import { normalizeMobileNumber } from "../../utils/mobileNumberVaildation";

// ✅ Request OTP
export const requestOtp = async (req: Request, res: Response) => {
  try {
    let { mobile_number } = req.body;
    mobile_number = normalizeMobileNumber(mobile_number);

    const otp = generateOTP();
    await sendOTP(mobile_number, otp);
    await saveOTPDetails(mobile_number, otp);

    return res.json(createResponse(200, "OTP sent successfully."));
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json(createResponse(500, "Failed to send OTP."));
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  let mobile_number = normalizeMobileNumber(req.body.mobile_number); // declared outside
  const otp = req.body.otp;

  try {
    const isVerified = await verifyOTP(mobile_number, otp);

    const { user_id, status: userProfileStatus } =
      await checkUserProfileStatus(mobile_number);

    const device_token = generateDeviceToken();
    await storeDeviceToken(mobile_number, device_token);

    return res.json(
      createResponse(200, "OTP verified successfully.", {
        device_token,
        user_profile: userProfileStatus,
        user_id,
      })
    );
  } catch (error: any) {
    if (error.message === "OTP has already been verified.") {
      const existing_device_token = await getStoredDeviceToken(mobile_number);
      const { user_id, status: userProfileStatus } =
        await checkUserProfileStatus(mobile_number);

      return res.json(
        createResponse(200, "OTP already verified.", {
          device_token: existing_device_token,
          user_profile: userProfileStatus,
          user_id,
        })
      );
    }

    console.error("Error verifying OTP:", error);
    return res.status(500).json(createResponse(500, "Failed to verify OTP."));
  }
};
