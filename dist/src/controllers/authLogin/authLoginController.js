"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.requestOtp = void 0;
const authLoginModel_1 = require("../../models/authLogin/authLoginModel");
const authLogin_1 = require("../../services/authLogin");
const responseHandler_1 = require("../../utils/responseHandler");
const tokenUtils_1 = require("../../utils/tokenUtils");
// Request OTP
const requestOtp = async (req, res) => {
    const { mobile_number } = req.body;
    const otp = (0, authLogin_1.generateOTP)();
    const device_token = (0, tokenUtils_1.generateDeviceToken)(); // Function to generate device token
    try {
        await (0, authLogin_1.sendOTP)(mobile_number, otp);
        await (0, authLoginModel_1.saveOTPDetails)(mobile_number, otp, device_token); // Save OTP and device token
        res.json((0, responseHandler_1.createResponse)(200, "OTP sent successfully."));
    }
    catch (error) {
        console.error("Error requesting OTP:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to send OTP."));
    }
};
exports.requestOtp = requestOtp;
// Verify OTP
const verifyOtp = async (req, res) => {
    const { mobile_number, otp } = req.body;
    try {
        const isVerified = await (0, authLoginModel_1.verifyOTP)(mobile_number, otp);
        if (isVerified) {
            res.json((0, responseHandler_1.createResponse)(200, "OTP verified successfully."));
        }
        else {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid OTP."));
        }
    }
    catch (error) {
        // Handle specific error cases
        if (error.message === "OTP has already been verified.") {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "OTP has already been verified."));
        }
        else {
            console.error("Error verifying OTP:", error);
            res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to verify OTP."));
        }
    }
};
exports.verifyOtp = verifyOtp;
