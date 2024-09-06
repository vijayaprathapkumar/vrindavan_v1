"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.requestOTP = void 0;
const authLogin_1 = require("../services/authLogin");
const databaseConnection_1 = require("../config/databaseConnection");
const responseHandler_1 = require("../utils/responseHandler");
const requestOTP = async (req, res) => {
    const { mobile_number } = req.body;
    const otp = (0, authLogin_1.generateOTP)();
    const otpExpiresAt = new Date(Date.now() + 10 * 60000); // OTP expires in 10 minutes
    try {
        databaseConnection_1.db.query("SELECT * FROM users WHERE mobile_number = ?", [mobile_number], (err, result) => {
            if (err)
                return res.status(500).json((0, responseHandler_1.createResponse)(500, "Database error"));
            const query = result.length === 0
                ? "INSERT INTO users (mobile_number, otp_code, otp_expires_at) VALUES (?, ?, ?)"
                : "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE mobile_number = ?";
            const params = result.length === 0
                ? [mobile_number, otp, otpExpiresAt]
                : [otp, otpExpiresAt, mobile_number];
            databaseConnection_1.db.query(query, params, async (err) => {
                if (err)
                    return res.status(500).json((0, responseHandler_1.createResponse)(500, "Database error"));
                await (0, authLogin_1.sendOTP)(mobile_number, otp);
                res.json((0, responseHandler_1.createResponse)(200, "OTP sent successfully"));
            });
        });
    }
    catch (error) {
        console.error("Error in requestOTP:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Server error"));
    }
};
exports.requestOTP = requestOTP;
const verifyOTP = async (req, res) => {
    const { mobile_number, otp } = req.body;
    try {
        databaseConnection_1.db.query("SELECT * FROM users WHERE mobile_number = ? AND otp_code = ? AND otp_expires_at > NOW()", [mobile_number, otp], (err, result) => {
            if (err)
                return res.status(500).json((0, responseHandler_1.createResponse)(500, "Database error"));
            if (result.length === 0) {
                return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid or expired OTP"));
            }
            res.json((0, responseHandler_1.createResponse)(200, "OTP verified successfully"));
        });
    }
    catch (error) {
        console.error("Error in verifyOTP:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Server error"));
    }
};
exports.verifyOTP = verifyOTP;
