import { Request, Response } from "express";
import { generateOTP, sendOTP } from "../../services/authLogin";
import {
  findOTPByMobileNumber,
  insertOTP,
  updateOTP,
  verifyOTPFromDb,
  markOTPAsVerified
} from "../../models/authLogin/authLoginModel";
import { createResponse } from "../../utils/responseHandler";
import { generateToken, generateDeviceToken } from "../../utils/tokenUtils";

export const requestOTP = async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | void> => {
  const { mobile_number } = req.body;

  const otp = generateOTP(); // Ensure this generates a new OTP
  const device_token = generateDeviceToken(); // Generate device token
  const token = generateToken(mobile_number); // Generate JWT token

  console.log("Generated OTP:", otp);
  
  try {
    const result = await findOTPByMobileNumber(mobile_number);
    const queryMethod = result.length === 0 ? insertOTP : updateOTP;

    await queryMethod(mobile_number, otp, device_token); // Store the OTP and device token
    await sendOTP(mobile_number, otp); // Ensure this sends the OTP to the user

    return res.json(createResponse(200, "OTP sent successfully", { token }));
  } catch (error) {
    console.error("Error in requestOTP:", error);
    return res.status(500).json(createResponse(500, "Server error"));
  }
};


export const verifyOTP = async (req: Request, res: Response): Promise<Response<any, Record<string, any>> | void> => {
  const { mobile_number, otp } = req.body;

  console.log("Verifying OTP for:", { mobile_number, otp });

  console.log("Verifying OTP for:", { mobile_number, otp });

  try {
    const result = await verifyOTPFromDb(mobile_number, otp);
    console.log("Database verification result:", result);

    if (result.length === 0) {
      console.log("Verification failed: No matching records found."); 
      return res.status(400).json(createResponse(400, "Invalid or expired OTP"));
    }

    await markOTPAsVerified(mobile_number);
    return res.json(createResponse(200, "OTP verified successfully"));
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return res.status(500).json(createResponse(500, "Server error"));
  }
};
