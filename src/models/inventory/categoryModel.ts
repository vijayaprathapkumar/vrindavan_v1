import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all categories with limit and offset for pagination
export const getAllCategories = async (
  limit: number,
  offset: number,
  searchTerm: string,
  sortField: string,
  sortOrder: string
): Promise<{ rows: RowDataPacket[]; total: number }> => {
  const validSortFields: Record<string, string> = {
    name: "c.name",
    weightage: "CAST(c.weightage AS UNSIGNED)",
    updated_at: "c.updated_at",
  };

  const sortColumn = validSortFields[sortField] || validSortFields["name"];
  const orderDirection = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

  let query = `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      c.description,
      c.weightage,
      c.created_at,
      c.updated_at,
      m.id AS media_id,
      m.model_id,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
            CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/category/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM 
      categories c
    LEFT JOIN 
      media m ON c.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Category')
    WHERE 
      (c.name LIKE ? OR CAST(c.weightage AS CHAR) = ?)
    ORDER BY ${sortColumn} ${orderDirection}
    LIMIT ? OFFSET ?
  `;

  const params = [`%${searchTerm}%`, searchTerm, limit, offset];
  const [rows] = await db.promise().query<RowDataPacket[]>(query, params);

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM categories c
    LEFT JOIN media m ON c.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Category')
    WHERE (c.name LIKE ? OR CAST(c.weightage AS CHAR) = ?)
  `;
  const [countResult] = await db.promise().query<RowDataPacket[]>(countQuery, [`%${searchTerm}%`, searchTerm]);

  const total = (countResult[0] as { total: number }).total;

  return { rows, total };
};


// Fetch total count of categories that match the search term
export const getCategoriesCount = async (
  searchTerm: string
): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count FROM categories 
    WHERE name LIKE ? OR weightage = ?
  `;
  const params = [`%${searchTerm}%`, parseInt(searchTerm) || -1];
  const [rows] = await db.promise().query<RowDataPacket[]>(query, params);
  return rows[0].count;
};

// Create a new category
export const createCategory = async (
  name: string,
  description: string,
  weightage: number
): Promise<number> => {
  const query = `
      INSERT INTO categories (name, description, weightage, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
  `;
  const params = [name, description, weightage];
  const [result]: any = await db.promise().query(query, params);
  return result.insertId;
};

export const getCategoryById = async (id: number): Promise<RowDataPacket[]> => {
  const query = `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      c.description,
      c.weightage,
      c.created_at AS category_created_at,
      m.id AS media_id,
      m.model_id,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/category/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM 
      categories c
    LEFT JOIN 
      media m ON c.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Category')
    WHERE 
      c.id = ? 
  `;

  const [rows] = await db.promise().query<RowDataPacket[]>(query, [id]);
  return rows;
};

// Update category by ID (with optional image)
export const updateCategoryById = async (
  id: number,
  name: string,
  description: string,
  weightage: number
): Promise<void> => {
  let query =
    "UPDATE categories SET name = ?, description = ?, weightage = ?, updated_at = NOW()";
  const params: (string | number)[] = [name, description, weightage];

  query += " WHERE id = ?";
  params.push(id);

  await db.promise().query<OkPacket>(query, params);
};

// Delete category by ID
export const deleteCategoryById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM categories WHERE id = ?", [id]);
};
