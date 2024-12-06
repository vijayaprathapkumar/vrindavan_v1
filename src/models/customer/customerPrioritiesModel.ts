import { ResultSetHeader } from "mysql2";
import { db } from "../../config/databaseConnection";

export const updateDeliveryPriority = async (
  userId: number,
  deliveryPriority: string
): Promise<ResultSetHeader> => {
  const query = `
    UPDATE users
    SET delivery_priority = ?, updated_at = NOW()
    WHERE id = ?;
  `;

  const [result] = await db
    .promise()
    .query<ResultSetHeader>(query, [deliveryPriority, userId]);

  return result;
};
