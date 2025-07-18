"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarProductsWithCount = exports.getSubcategoryId = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch the subcategory ID of a given food item
// Fetch similar products within the same subcategory
// Helper function to get subcategory ID
const getSubcategoryId = async (foodId) => {
    const query = "SELECT subcategory_id FROM foods WHERE id = ?";
    const [rows] = await databaseConnection_1.db.promise().query(query, [foodId]);
    return rows[0]?.subcategory_id || null;
};
exports.getSubcategoryId = getSubcategoryId;
const getSimilarProductsWithCount = async (subcategoryId, foodId, limit, offset) => {
    const countQuery = `SELECT COUNT(*) AS totalProducts FROM foods WHERE subcategory_id = ? AND id != ?`;
    const productsQuery = `
    SELECT 
      f.*, 
      CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url,
      CASE
        WHEN f.track_inventory = 0 THEN 0  -- Always available if track_inventory is 0
        WHEN f.track_inventory = 1 AND (
          -- Either no stock record exists (considered as 0 stock)
          sm.stockable_id IS NULL 
          -- OR total stock is 0
          OR sm.total_stock = 0
        ) THEN 1  -- Out of stock
        ELSE 0  -- In stock
      END AS outOfStock
    FROM 
      foods f
    LEFT JOIN 
      media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    LEFT JOIN (
      SELECT 
        stockable_id,
        SUM(amount) AS total_stock
      FROM 
        stock_mutations
      WHERE 
        stockable_type = 'App\\\\Models\\\\Food'
      GROUP BY 
        stockable_id
    ) sm ON f.id = sm.stockable_id
    WHERE 
      f.subcategory_id = ? AND f.id != ?
    ORDER BY f.name ASC
    LIMIT ? OFFSET ?;
  `;
    try {
        const [countRows] = await databaseConnection_1.db
            .promise()
            .query(countQuery, [subcategoryId, foodId]);
        const [productRows] = await databaseConnection_1.db
            .promise()
            .query(productsQuery, [subcategoryId, foodId, limit, offset]);
        return {
            products: productRows.map((row) => ({
                ...row,
                original_url: row.original_url,
                outOfStock: row.outOfStock === 1 ? 0 : 1
            })),
            totalProducts: countRows[0]?.totalProducts || 0,
        };
    }
    catch (error) {
        console.error("Error in getSimilarProductsWithCount:", error);
        throw error;
    }
};
exports.getSimilarProductsWithCount = getSimilarProductsWithCount;
