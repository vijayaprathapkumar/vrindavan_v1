import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

export const getStockSummaryModel = async () => {
    const query = `
SELECT stock_status, COUNT(*) AS count
FROM (
    SELECT 
        f.id,
        f.track_inventory,
        COALESCE((SELECT SUM(sm.amount) FROM stock_mutations sm WHERE sm.stockable_id = f.id), 0) AS StockData,
        CASE 
            WHEN f.track_inventory = 'true' AND COALESCE((SELECT SUM(sm.amount) FROM stock_mutations sm WHERE sm.stockable_id = f.id), 0) <= 0 
                THEN 'Out of Stock'
            WHEN f.track_inventory = 'true' AND COALESCE((SELECT SUM(sm.amount) FROM stock_mutations sm WHERE sm.stockable_id = f.id), 0) BETWEEN 1 AND 5 
                THEN 'Low Stock'
            WHEN f.track_inventory = 'false' OR COALESCE((SELECT SUM(sm.amount) FROM stock_mutations sm WHERE sm.stockable_id = f.id), 0) > 5
                THEN 'In Stock'
        END AS stock_status
    FROM foods f
) AS stock_data
GROUP BY stock_status;


    `;

    const [rows] = await db.promise().execute<RowDataPacket[]>(query);
    return rows;
};
