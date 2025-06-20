import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

// ✅ Check if user profile is complete
export const checkUserProfileStatus = async (
  mobile_number: string
): Promise<{ user_id: number | null; status: number }> => {
  const sql = `
    SELECT 
      u.id AS user_id,
      CASE 
        WHEN u.name IS NOT NULL 
          AND u.email IS NOT NULL 
          AND u.phone IS NOT NULL 
          AND da.user_id IS NOT NULL 
          AND da.locality_id IS NOT NULL 
          AND (
            (da.house_no IS NOT NULL AND da.house_no != '')
            OR 
            (da.complete_address IS NOT NULL AND da.complete_address != '')
          )
        THEN 1 ELSE 0
      END AS userProfileStatus
    FROM users u
     INNER JOIN delivery_addresses da ON u.id = da.user_id
    WHERE u.phone = ?;
  `;

  const [rows]: [RowDataPacket[], any] = await db.promise().query(sql, [mobile_number]);

  if (rows.length === 0) return { user_id: null, status: 0 };

  const { user_id, userProfileStatus } = rows[0];
  return { user_id, status: userProfileStatus };
};


// ✅ Save or update OTP details
export const saveOTPDetails = async (
  mobile_number: string,
  otp: string
): Promise<void> => {
  const checkSql = `SELECT id FROM user_one_time_passwords WHERE mobile = ?`;
  const [rows]: [RowDataPacket[], any] = await db.promise().query(checkSql, [mobile_number]);

  if (rows.length > 0) {
    const updateSql = `
      UPDATE user_one_time_passwords 
      SET otp = ?, is_verified = 0, updated_at = NOW() 
      WHERE mobile = ?;
    `;
    await db.promise().query(updateSql, [otp, mobile_number]);
  } else {
    const insertSql = `
      INSERT INTO user_one_time_passwords (mobile, otp, created_at, updated_at) 
      VALUES (?, ?, NOW(), NOW());
    `;
    await db.promise().query(insertSql, [mobile_number, otp]);
  }
};

// ✅ Verify OTP
export const verifyOTP = async (
  mobile_number: string,
  otp: string
): Promise<boolean> => {
  const sql = `
    SELECT * FROM user_one_time_passwords 
    WHERE mobile = ? AND otp = ?;
  `;
  const [rows]: [RowDataPacket[], any] = await db.promise().query(sql, [mobile_number, otp]);

  if (rows.length === 0) return false;

  const otpRecord = rows[0];

  if (otpRecord.is_verified) {
    throw new Error("OTP has already been verified.");
  }

  await markOTPAsVerified(otpRecord.id);
  return true;
};

// ✅ Mark OTP as verified
const markOTPAsVerified = async (id: number): Promise<void> => {
  const sql = `
    UPDATE user_one_time_passwords 
    SET is_verified = 1, updated_at = NOW() 
    WHERE id = ?;
  `;
  await db.promise().query(sql, [id]);
};

// ✅ Store Device Token
export const storeDeviceToken = async (
  mobile_number: string,
  device_token: string
): Promise<void> => {
  const sql = `
    UPDATE user_one_time_passwords 
    SET device_token = ?, updated_at = NOW() 
    WHERE mobile = ?;
  `;
  await db.promise().query(sql, [device_token, mobile_number]);
};

// ✅ Get Device Token if already stored
export const getStoredDeviceToken = async (
  mobile_number: string
): Promise<string | null> => {
  const sql = `
    SELECT device_token FROM user_one_time_passwords 
    WHERE mobile = ? AND device_token IS NOT NULL;
  `;
  const [rows]: [RowDataPacket[], any] = await db.promise().query(sql, [mobile_number]);

  return rows.length > 0 ? rows[0].device_token : null;
};
