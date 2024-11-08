import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

export const getFeaturedCategories = async (
  limit?: number,
  offset?: number,
  searchTerm?: string
): Promise<{ totalItems: number; data: any[] }> => {
  let countQuery = `
        SELECT COUNT(*) AS totalItems
        FROM featured_categories AS fc
        JOIN categories AS c ON fc.category_id = c.id
        JOIN foods AS f ON fc.category_id = f.category_id
        LEFT JOIN media AS m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    `;

  if (searchTerm) {
    countQuery += `
            WHERE c.name LIKE ? OR f.name LIKE ? OR f.description LIKE ?
        `;
  }

  let query = `
        SELECT fc.*, c.name AS category_name, c.description AS category_description, 
               f.*,
               CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
        FROM featured_categories AS fc
        JOIN categories AS c ON fc.category_id = c.id
        JOIN foods AS f ON fc.category_id = f.category_id
        LEFT JOIN media AS m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    `;

  if (searchTerm) {
    query += `
            WHERE c.name LIKE ? OR f.name LIKE ? OR f.description LIKE ?
        `;
  }

  query += `
        ORDER BY fc.created_at DESC
        LIMIT ? OFFSET ?;
    `;

  const params: any[] = [];
  if (searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  params.push(limit, offset);

  const [countRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(countQuery, params.slice(0, 3));
  const totalItems = countRows[0]?.totalItems || 0;

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, params);

  return {
    totalItems,
    data: rows,
  };
};
