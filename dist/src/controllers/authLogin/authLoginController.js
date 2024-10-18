"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.requestOtp = void 0;
const authLoginModel_1 = require("../../models/authLogin/authLoginModel");
const responseHandler_1 = require("../../utils/responseHandler");
const tokenUtils_1 = require("../../utils/tokenUtils");
const msg91_1 = require("../../services/msg91");
// Request OTP
const requestOtp = async (req, res) => {
    const { mobile_number } = req.body;
    const otp = (0, msg91_1.generateOTP)();
    try {
        const { user_id, status: userProfileStatus } = await (0, authLoginModel_1.checkUserProfileStatus)(mobile_number);
        await (0, msg91_1.sendOTP)(mobile_number, otp);
        await (0, authLoginModel_1.saveOTPDetails)(mobile_number, otp);
        if (userProfileStatus === 1) {
            res.json((0, responseHandler_1.createResponse)(200, "OTP sent successfully.", { user_profile: 1, user_id }));
        }
        else if (userProfileStatus === 0) {
            res.json((0, responseHandler_1.createResponse)(200, "OTP sent. Profile is incomplete.", { user_profile: 0, user_id }));
        }
        else {
            res.json((0, responseHandler_1.createResponse)(200, "OTP sent. User does not exist.", { user_profile: 0, user_id: null }));
        }
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
            const device_token = (0, tokenUtils_1.generateDeviceToken)();
            await (0, authLoginModel_1.storeDeviceToken)(mobile_number, device_token);
            res.json((0, responseHandler_1.createResponse)(200, "OTP verified successfully.", { device_token }));
        }
        else {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid OTP."));
        }
    }
    catch (error) {
        if (error.message === "OTP has already been verified.") {
            const existing_device_token = await (0, authLoginModel_1.getStoredDeviceToken)(mobile_number);
            res.status(400).json((0, responseHandler_1.createResponse)(400, "OTP has already been verified.", { device_token: existing_device_token }));
        }
        else {
            console.error("Error verifying OTP:", error);
            res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to verify OTP."));
        }
    }
};
exports.verifyOtp = verifyOtp;
