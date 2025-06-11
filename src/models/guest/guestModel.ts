import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

export const findGuestByUsers = async (): Promise<RowDataPacket | null> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM users WHERE email = ?", [
      "guest@vrindavanmilk.com",
    ]);

  return rows.length > 0 ? rows[0] : null;
};
