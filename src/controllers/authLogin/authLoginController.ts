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

// Request OTP

export const requestOtp = async (req: Request, res: Response) => {
  let { mobile_number } = req.body;
  mobile_number = normalizeMobileNumber(mobile_number);
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
  let { mobile_number, otp } = req.body;

  mobile_number = normalizeMobileNumber(mobile_number);

  try {
    const isVerified = await verifyOTP(mobile_number, otp);

    if (isVerified) {
      const { user_id, status: userProfileStatus } =
        await checkUserProfileStatus(mobile_number);

      const device_token = generateDeviceToken();
      await storeDeviceToken(mobile_number, device_token);

      if (userProfileStatus === 1) {
        return res.json(
          createResponse(200, "OTP verified successfully.", {
            device_token,
            user_profile: 1,
            user_id,
          })
        );
      } else {
        return res.json(
          createResponse(200, "OTP verified. Profile is incomplete.", {
            device_token,
            user_profile: 0,
            user_id,
          })
        );
      }
    } else {
      return res.status(400).json(createResponse(400, "Invalid OTP."));
    }
  } catch (error) {
    if (error.message === "OTP has already been verified.") {
      const existing_device_token = await getStoredDeviceToken(mobile_number);

      const { user_id, status: userProfileStatus } =
        await checkUserProfileStatus(mobile_number);

      return res.status(200).json(
        createResponse(200, "OTP has already been verified.", {
          device_token: existing_device_token,
          user_profile: userProfileStatus,
          user_id,
        })
      );
    } else {
      console.error("Error verifying OTP:", error);
      return res.status(500).json(createResponse(500, "Failed to verify OTP."));
    }
  }
};
