import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllSubCategoriesWithCategory = async (
  limit: number,
  offset: number,
  searchTerm: string
): Promise<RowDataPacket[]> => {
  const query = `
    SELECT 
      sub_categories.*, 
      categories.name AS category_name, 
      categories.description AS category_description, 
      m.id AS media_id,
      m.model_type,
      m.model_id,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      sub_categories
    LEFT JOIN 
      categories ON sub_categories.category_id = categories.id
    LEFT JOIN 
      media m ON sub_categories.category_id = m.model_id AND m.model_type = 'App\\\\Models\\\\Category'
    WHERE 
      sub_categories.name LIKE ? OR 
      categories.name LIKE ? OR 
      sub_categories.weightage LIKE ?
    ORDER BY 
      sub_categories.created_at DESC  
    LIMIT ? 
    OFFSET ?;
  `;
  
  const searchWildcard = `%${searchTerm}%`;
  const [rows] = await db.promise().query<RowDataPacket[]>(query, [searchWildcard, searchWildcard, searchWildcard, limit, offset]);
  return rows;
};




// Create a new subcategory
export const createSubCategory = async (
  category_id: number,
  name: string,
  description: string,
  weightage: string,
  active: boolean
): Promise<OkPacket> => {
  const [result] = await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO sub_categories (category_id, name, description, weightage, active) VALUES (?, ?, ?, ?, ?)",
      [category_id, name, description, weightage, active]
    );
  return result;
};

// Fetch subcategory by ID
export const getSubCategoryById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(`
        SELECT 
          sub_categories.*, 
          categories.name AS category_name, 
          categories.description AS category_description, 
          m.id AS media_id,
          m.model_type,
          m.model_id,
          m.uuid,
          m.collection_name,
          m.name AS media_name,
          m.file_name,
          m.mime_type,
          m.disk,
          m.conversions_disk,
          m.size,
          m.created_at AS media_created_at,
          m.updated_at AS media_updated_at,
          CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
        FROM 
          sub_categories
        LEFT JOIN 
          categories ON sub_categories.category_id = categories.id
        LEFT JOIN 
          media m ON sub_categories.category_id = m.model_id AND m.model_type = 'App\\\\Models\\\\Category'
        WHERE 
          sub_categories.id = ?  
        ORDER BY 
          sub_categories.created_at DESC;
    `, 
    [id]);  
  return rows;
};


// Update subcategory by ID
export const updateSubCategoryById = async (
  id: number,
  category_id: number,
  name: string,
  description: string,
  weightage: string,
  active: boolean
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE sub_categories SET category_id = ?, name = ?, description = ?, weightage = ?, active = ? WHERE id = ?",
      [category_id, name, description, weightage, active, id]
    );
};

// Delete subcategory by ID
export const deleteSubCategoryById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM sub_categories WHERE id = ?", [id]);
};
