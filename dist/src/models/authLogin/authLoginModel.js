"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markOTPAsVerified = exports.verifyOTPFromDb = exports.updateOTP = exports.insertOTP = exports.findOTPByMobileNumber = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const findOTPByMobileNumber = (mobile_number) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("SELECT * FROM user_one_time_passwords WHERE mobile = ?", [mobile_number], (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
};
exports.findOTPByMobileNumber = findOTPByMobileNumber;
const insertOTP = (mobile_number, otp, device_token) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("INSERT INTO user_one_time_passwords (mobile, otp, device_token, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())", [mobile_number, otp, device_token, 0], (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.insertOTP = insertOTP;
const updateOTP = (mobile_number, otp, device_token) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_one_time_passwords SET otp = ?, device_token = ?, is_verified = 0, updated_at = NOW() WHERE mobile = ?", [otp, device_token, mobile_number], (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.updateOTP = updateOTP;
const verifyOTPFromDb = (mobile_number, otp) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM user_one_time_passwords 
        WHERE mobile = ? AND otp = ? AND is_verified = 0 
        AND created_at > NOW() - INTERVAL 10 MINUTE
      `;
        databaseConnection_1.db.query(query, [mobile_number, otp], (err, result) => {
            if (err)
                return reject(err);
            resolve(result);
        });
    });
};
exports.verifyOTPFromDb = verifyOTPFromDb;
const markOTPAsVerified = (mobile_number) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_one_time_passwords SET is_verified = 1 WHERE mobile = ?", [mobile_number], (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
exports.markOTPAsVerified = markOTPAsVerified;
