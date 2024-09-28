"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.saveOTPDetails = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Save or update OTP details in the database
const saveOTPDetails = async (mobile_number, otp, device_token) => {
    const checkSql = `
    SELECT * FROM user_one_time_passwords 
    WHERE mobile = ?;
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(checkSql, [mobile_number]);
    if (rows.length > 0) {
        const sql = `
      UPDATE user_one_time_passwords 
      SET otp = ?, device_token = ?, is_verified = 0, updated_at = NOW() 
      WHERE mobile = ?;
    `;
        const values = [otp, device_token, mobile_number];
        await databaseConnection_1.db.promise().query(sql, values);
    }
    else {
        const sql = `
      INSERT INTO user_one_time_passwords (mobile, otp, device_token, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW());
    `;
        const values = [mobile_number, otp, device_token];
        await databaseConnection_1.db.promise().query(sql, values);
    }
};
exports.saveOTPDetails = saveOTPDetails;
// Verify OTP
const verifyOTP = async (mobile_number, otp) => {
    const sql = `
    SELECT * FROM user_one_time_passwords 
    WHERE mobile = ? AND otp = ?;
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(sql, [mobile_number, otp]);
    if (rows.length > 0) {
        const otpRecord = rows[0];
        if (otpRecord.is_verified) {
            throw new Error("OTP has already been verified.");
        }
        await markOTPAsVerified(otpRecord.id);
        return true;
    }
    return false;
};
exports.verifyOTP = verifyOTP;
// Mark OTP as verified
const markOTPAsVerified = async (id) => {
    const sql = `
    UPDATE user_one_time_passwords 
    SET is_verified = 1, updated_at = NOW() 
    WHERE id = ?;
  `;
    await databaseConnection_1.db.promise().query(sql, [id]);
};
