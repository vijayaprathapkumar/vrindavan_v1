import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

export const getStockCounts = async () => {
  const query = `
    SELECT 
        (SELECT COUNT(*) FROM foods f 
         WHERE f.track_inventory = 1 
         AND COALESCE((SELECT SUM(amount) FROM stock_mutations WHERE stockable_id = f.id), 0) <= 0) 
         AS outOfStockCount,

        (SELECT COUNT(*) FROM foods f 
         WHERE f.track_inventory = 1 
         AND COALESCE((SELECT SUM(amount) FROM stock_mutations WHERE stockable_id = f.id), 0) BETWEEN 1 AND 5) 
         AS lowStockCount,

        (SELECT COUNT(*) FROM foods f 
         WHERE f.track_inventory IN (0, 1) 
         AND COALESCE((SELECT SUM(amount) FROM stock_mutations WHERE stockable_id = f.id), 0) > 5) 
         AS inStockCount`;

  const [rows] = await db.promise().query<RowDataPacket[]>(query);

  return rows[0]; // Returns { outOfStockCount, lowStockCount, inStockCount }
};
