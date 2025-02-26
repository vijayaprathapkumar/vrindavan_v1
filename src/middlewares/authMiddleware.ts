import { Request, Response, NextFunction } from "express";
import { db } from "../config/databaseConnection";
import { RowDataPacket } from "mysql2";


export const verifyDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: 401, message: "Authorization header is required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const sql = `
      SELECT COUNT(*) as count FROM user_one_time_passwords WHERE device_token = ? 
      UNION ALL
      SELECT COUNT(*) as count FROM users WHERE device_token = ?;
    `;

    // Pass token twice, once for each placeholder
    const [rows]: [RowDataPacket[], any] = await db
      .promise()
      .query(sql, [token, token]);

    // Check if the sum of counts is zero (no matching device_token found)
    const totalCount = rows.reduce((sum, row) => sum + row.count, 0);

    if (totalCount === 0) {
      return res.status(401).json({ status: 401, message: "Invalid device token." });
    }

    next();
  } catch (error) {
    console.error("Error verifying device token:", error);
    res.status(500).json({ status: 500, message: "Internal server error." });
  }
};
