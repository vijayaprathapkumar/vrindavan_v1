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
                CASE 
                WHEN m.conversions_disk = 'public1' 
                THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
                ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
              END AS original_url
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

interface FeaturedCategoryInput {
  category_id: number;
  sub_category_id?: number;
  status: number;
  category_type?: number;
}

export const createFeaturedCategory = async (data: FeaturedCategoryInput): Promise<any> => {
  const { category_id, sub_category_id, status, category_type } = data;

  const query = `
      INSERT INTO featured_categories (category_id, sub_category_id, status, category_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW());
  `;

  const params = [category_id, sub_category_id || null, status, category_type || null];

  const [result]: any = await db.promise().query(query, params);

  return {
      id: result.insertId,
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
  };
};