import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";


// Save or update OTP details in the database
export const saveOTPDetails = async (
  mobile_number: string,
  otp: string,
  device_token: string
): Promise<void> => {
  const checkSql = `
    SELECT * FROM user_one_time_passwords 
    WHERE mobile = ?;
  `;
  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(checkSql, [mobile_number]);

  if (rows.length > 0) {
    const sql = `
      UPDATE user_one_time_passwords 
      SET otp = ?, device_token = ?, is_verified = 0, updated_at = NOW() 
      WHERE mobile = ?;
    `;
    const values = [otp, device_token, mobile_number];
    await db.promise().query(sql, values);
  } else {
    const sql = `
      INSERT INTO user_one_time_passwords (mobile, otp, device_token, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW());
    `;
    const values = [mobile_number, otp, device_token];
    await db.promise().query(sql, values);
  }
};

// Verify OTP
export const verifyOTP = async (
  mobile_number: string,
  otp: string
): Promise<boolean> => {
  const sql = `
    SELECT * FROM user_one_time_passwords 
    WHERE mobile = ? AND otp = ?;
  `;
  const [rows]: [RowDataPacket[], any] = await db
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

// Mark OTP as verified
const markOTPAsVerified = async (id: number): Promise<void> => {
  const sql = `
    UPDATE user_one_time_passwords 
    SET is_verified = 1, updated_at = NOW() 
    WHERE id = ?;
  `;
  await db.promise().query(sql, [id]);
};
