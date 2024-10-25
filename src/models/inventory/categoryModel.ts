import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all categories with limit and offset for pagination
export const getAllCategories = async (
  limit: number,
  offset: number,
  searchTerm: string
): Promise<RowDataPacket[]> => {
  const query = `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      c.description,
      c.weightage,
      c.created_at,
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
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url 
    FROM 
      categories c
    LEFT JOIN 
      media m ON c.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Category'
    WHERE 
      (c.name LIKE ? OR c.weightage = ?) 
    ORDER BY 
      CAST(c.weightage AS UNSIGNED) ASC
    LIMIT ? OFFSET ?
  `;
  
  const params = [`%${searchTerm}%`, parseInt(searchTerm) || -1, limit, offset];
  const [rows] = await db.promise().query<RowDataPacket[]>(query, params);
  return rows;
};


// Fetch total count of categories that match the search term
export const getCategoriesCount = async (searchTerm: string): Promise<number> => {
  const query = `
    SELECT COUNT(*) as count FROM categories 
    WHERE name LIKE ? OR weightage = ?
  `;
  const params = [`%${searchTerm}%`, parseInt(searchTerm) || -1];
  const [rows] = await db.promise().query<RowDataPacket[]>(query, params);
  return rows[0].count;
};

// Create a new category (with optional image)
export const createCategory = async (
  name: string,
  description: string,
  weightage: number,
  image?: string
): Promise<void> => {
  const query = image
    ? `
      INSERT INTO categories (name, description, weightage, image, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `
    : `
      INSERT INTO categories (name, description, weightage, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
    `;

  const params = image
    ? [name, description, weightage, image]
    : [name, description, weightage];

  await db.promise().query<OkPacket>(query, params);
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
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url 
    FROM 
      categories c
    LEFT JOIN 
      media m ON c.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Category'
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
  weightage: number,
  image?: string
): Promise<void> => {
  let query = "UPDATE categories SET name = ?, description = ?, weightage = ?, updated_at = NOW()";
  const params: (string | number)[] = [name, description, weightage];

  if (image) {
    query += ", image = ?";
    params.push(image);
  }

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
