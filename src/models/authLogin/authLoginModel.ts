import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

export const findOTPByMobileNumber = (mobile_number: string): Promise<RowDataPacket[]> => {
  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      "SELECT * FROM user_one_time_passwords WHERE mobile = ?",
      [mobile_number],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

export const insertOTP = (mobile_number: string, otp: string, device_token: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO user_one_time_passwords (mobile, otp, device_token, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [mobile_number, otp, device_token, 0],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

export const updateOTP = (mobile_number: string, otp: string, device_token: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE user_one_time_passwords SET otp = ?, device_token = ?, is_verified = 0, updated_at = NOW() WHERE mobile = ?",
      [otp, device_token, mobile_number],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};

export const verifyOTPFromDb = (mobile_number: string, otp: string): Promise<RowDataPacket[]> => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM user_one_time_passwords 
        WHERE mobile = ? AND otp = ? AND is_verified = 0 
        AND created_at > NOW() - INTERVAL 10 MINUTE
      `;
      db.query<RowDataPacket[]>(query, [mobile_number, otp], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };
  
  
  

export const markOTPAsVerified = (mobile_number: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE user_one_time_passwords SET is_verified = 1 WHERE mobile = ?",
      [mobile_number],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};
