"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockCounts = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getStockCounts = async () => {
    const query = `
    SELECT 
    SUM(CASE WHEN f.track_inventory = 1 AND COALESCE(sm.total_stock, 0) <= 0 THEN 1 ELSE 0 END) AS outOfStockCount,
    SUM(CASE WHEN f.track_inventory = 1 AND COALESCE(sm.total_stock, 0) BETWEEN 1 AND 5 THEN 1 ELSE 0 END) AS lowStockCount,
    SUM(CASE WHEN f.track_inventory IN (0, 1) THEN 1 ELSE 0 END) AS inStockCount
FROM 
    foods f
LEFT JOIN 
    (SELECT stockable_id, SUM(amount) AS total_stock 
     FROM stock_mutations 
     GROUP BY stockable_id) sm 
ON 
    f.id = sm.stockable_id;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query);
    return rows[0];
};
exports.getStockCounts = getStockCounts;
