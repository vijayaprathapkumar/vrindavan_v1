import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

export const getStockCounts = async () => {
  const query = `
    SELECT 
      SUM(CASE 
        WHEN f.track_inventory = 1 AND COALESCE(sm.total_amount, 0) <= 0 THEN 1 
        ELSE 0 
      END) AS outOfStockCount,

      SUM(CASE 
        WHEN f.track_inventory = 1 AND COALESCE(sm.total_amount, 0) BETWEEN 1 AND 5 THEN 1 
        ELSE 0 
      END) AS lowStockCount,

      SUM(CASE 
        WHEN f.track_inventory = 0 OR (
          f.track_inventory = 1 AND COALESCE(sm.total_amount, 0) > 5
        ) THEN 1 
        ELSE 0 
      END) AS inStockCount,

      COUNT(*) AS allStockCount

    FROM foods f
    LEFT JOIN (
      SELECT stockable_id, SUM(amount) AS total_amount
      FROM stock_mutations
      GROUP BY stockable_id
    ) sm ON sm.stockable_id = f.id;
  `;

  const [rows] = await db.promise().query<RowDataPacket[]>(query);
  return rows[0];
};
