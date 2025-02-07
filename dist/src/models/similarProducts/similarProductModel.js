"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarProductsWithCount = exports.getSubcategoryId = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch the subcategory ID of a given food item
const getSubcategoryId = async (foodId) => {
    const query = `SELECT subcategory_id FROM foods WHERE id = ?`;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, [foodId]);
    return rows.length ? rows[0].subcategory_id : null;
};
exports.getSubcategoryId = getSubcategoryId;
// Fetch similar products within the same subcategory
const getSimilarProductsWithCount = async (subcategoryId, foodId, limit, offset) => {
    const countQuery = `SELECT COUNT(*) AS totalProducts FROM foods WHERE subcategory_id = ? AND id != ?`;
    const productsQuery = `
    SELECT 
      f.*, 
      CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM 
      foods f
    LEFT JOIN 
      media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      f.subcategory_id = ? AND f.id != ?
    ORDER BY f.name ASC
    LIMIT ? OFFSET ?;
  `;
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
        })),
        totalProducts: countRows[0]?.totalProducts || 0,
    };
};
exports.getSimilarProductsWithCount = getSimilarProductsWithCount;
