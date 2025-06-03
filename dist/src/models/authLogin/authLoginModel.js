"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoredDeviceToken = exports.storeDeviceToken = exports.verifyOTP = exports.saveOTPDetails = exports.checkUserProfileStatus = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const checkUserProfileStatus = async (mobile_number) => {
    const sql = `
    SELECT 
      u.id AS user_id,
      u.name IS NOT NULL AS name_filled,
      u.email IS NOT NULL AS email_filled,
      u.phone IS NOT NULL AS phone_filled,
      da.user_id IS NOT NULL AS user_id_filled,
      da.locality_id IS NOT NULL AS locality_id_filled,
      da.house_no IS NOT NULL AS house_no_filled,
      da.complete_address IS NOT NULL AS complete_address_filled
    FROM 
      users u
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
    WHERE 
      u.phone = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(sql, [mobile_number]);
    if (rows.length === 0) {
        return { user_id: null, status: 0 };
    }
    const row = rows[0];
    const allFieldsFilled = row.name_filled && row.email_filled && row.phone_filled &&
        row.user_id_filled && row.locality_id_filled &&
        row.house_no_filled && row.complete_address_filled;
    return { user_id: row.user_id, status: allFieldsFilled ? 1 : 0 };
};
exports.checkUserProfileStatus = checkUserProfileStatus;
// Save or update OTP details in the database
const saveOTPDetails = async (mobile_number, otp) => {
    // Remove country code (assuming it's always '+91')
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
      SET otp = ?, is_verified = 0, updated_at = NOW() 
      WHERE mobile = ?;
    `;
        const values = [otp, mobile_number];
        await databaseConnection_1.db.promise().query(sql, values);
    }
    else {
        const sql = `
      INSERT INTO user_one_time_passwords (mobile, otp, created_at, updated_at) 
      VALUES (?, ?, NOW(), NOW());
    `;
        const values = [mobile_number, otp];
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
// Store device token after OTP verification
const storeDeviceToken = async (mobile_number, device_token) => {
    const sql = `
    UPDATE user_one_time_passwords 
    SET device_token = ?, updated_at = NOW() 
    WHERE mobile = ?;
  `;
    const values = [device_token, mobile_number];
    await databaseConnection_1.db.promise().query(sql, values);
};
exports.storeDeviceToken = storeDeviceToken;
const getStoredDeviceToken = async (mobile_number) => {
    const sql = `
    SELECT device_token FROM user_one_time_passwords 
    WHERE mobile = ? AND device_token IS NOT NULL;
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(sql, [mobile_number]);
    if (rows.length > 0) {
        const { device_token } = rows[0];
        return device_token;
    }
    return null;
};
exports.getStoredDeviceToken = getStoredDeviceToken;
