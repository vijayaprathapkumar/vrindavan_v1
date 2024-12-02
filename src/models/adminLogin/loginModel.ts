import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";
import { db } from "../../config/databaseConnection";

export const adminVerify = async (email: string, password: string): Promise<RowDataPacket | null> => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  const [rows]: [RowDataPacket[], any] = await db.promise().query(sql, [email]);

  if (rows.length === 0) return null;

  const userRecord = rows[0];

  const passwordHash = userRecord.password.replace(/^\$2y\$/, "$2b$");

  const isPasswordMatch = await bcrypt.compare(password, passwordHash);

  if (isPasswordMatch) {
    return userRecord ? userRecord : null;
  }

  return null;
};

export const updateApiToken = async (userId: number, apiToken: string) => {
  const sql = `UPDATE users SET device_token = ? WHERE id = ?`;
  await db.promise().query(sql, [apiToken, userId]);
};
