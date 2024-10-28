import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

// Get subcategory ID by food ID
export const getSubcategoryId = async (
  foodId: number
): Promise<number | null> => {
  const query = `SELECT subcategory_id FROM foods WHERE id = ?`;
  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, [foodId]);
  return rows.length ? rows[0].subcategory_id : null;
};

// Get similar products
export const getSimilarProductsWithCount = async (
  subcategoryId: number,
  limit: number,
  offset: number
) => {
  const countQuery = `SELECT COUNT(*) AS totalProducts FROM foods WHERE subcategory_id = ?`;
  const productsQuery = `
    SELECT 
      f.*, 
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      foods f
    LEFT JOIN 
      media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      f.subcategory_id = ?
    ORDER BY f.name ASC
    LIMIT ? OFFSET ?;`;

  const [countRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(countQuery, [subcategoryId]);
  const [productRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(productsQuery, [subcategoryId, limit, offset]);

  return {
    products: productRows.map((row) => ({
      ...row,
      original_url: row.original_url,
    })),
    totalProducts: countRows[0]?.totalProducts || 0,
  };
};

// Get product by ID
export const getProductById = async (productId: number) => {
  const query = `
      SELECT 
        f.*,
        CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
      FROM 
        foods f
      LEFT JOIN 
        media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
      WHERE 
        f.id = ?;`;

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, [productId]);

  return rows[0] || null;
};
