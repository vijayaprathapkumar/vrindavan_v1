"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.requestOTP = void 0;
const authLogin_1 = require("../../services/authLogin");
const authLoginModel_1 = require("../../models/authLogin/authLoginModel");
const responseHandler_1 = require("../../utils/responseHandler");
const tokenUtils_1 = require("../../utils/tokenUtils");
const requestOTP = async (req, res) => {
    const { mobile_number } = req.body;
    const otp = (0, authLogin_1.generateOTP)(); // Ensure this generates a new OTP
    const device_token = (0, tokenUtils_1.generateDeviceToken)(); // Generate device token
    const token = (0, tokenUtils_1.generateToken)(mobile_number); // Generate JWT token
    console.log("Generated OTP:", otp);
    try {
        const result = await (0, authLoginModel_1.findOTPByMobileNumber)(mobile_number);
        const queryMethod = result.length === 0 ? authLoginModel_1.insertOTP : authLoginModel_1.updateOTP;
        await queryMethod(mobile_number, otp, device_token); // Store the OTP and device token
        await (0, authLogin_1.sendOTP)(mobile_number, otp); // Ensure this sends the OTP to the user
        return res.json((0, responseHandler_1.createResponse)(200, "OTP sent successfully", { token }));
    }
    catch (error) {
        console.error("Error in requestOTP:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Server error"));
    }
};
exports.requestOTP = requestOTP;
const verifyOTP = async (req, res) => {
    const { mobile_number, otp } = req.body;
    console.log("Verifying OTP for:", { mobile_number, otp });
    console.log("Verifying OTP for:", { mobile_number, otp });
    try {
        const result = await (0, authLoginModel_1.verifyOTPFromDb)(mobile_number, otp);
        console.log("Database verification result:", result);
        if (result.length === 0) {
            console.log("Verification failed: No matching records found.");
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid or expired OTP"));
        }
        await (0, authLoginModel_1.markOTPAsVerified)(mobile_number);
        return res.json((0, responseHandler_1.createResponse)(200, "OTP verified successfully"));
    }
    catch (error) {
        console.error("Error in verifyOTP:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Server error"));
    }
};
exports.verifyOTP = verifyOTP;
