import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all categories
export const getAllCategories = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM categories");
  return rows;
};

// Create a new category (with optional image)
export const createCategory = async (
  name: string,
  description: string,
  weightage: number,
  image?: string // Optional image
): Promise<void> => {
  const query = image
    ? "INSERT INTO categories (name, description, weightage, image) VALUES (?, ?, ?, ?)"
    : "INSERT INTO categories (name, description, weightage) VALUES (?, ?, ?)";
  
  const params = image ? [name, description, weightage, image] : [name, description, weightage];

  await db.promise().query<OkPacket>(query, params);
};

// Fetch category by ID
export const getCategoryById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM categories WHERE id = ?", [id]);
  return rows;
};

// Update category by ID (with optional image)
export const updateCategoryById = async (
  id: number,
  name: string,
  description: string,
  weightage: number,
  image?: string // Optional image
): Promise<void> => {
  let query = "UPDATE categories SET name = ?, description = ?, weightage = ?";
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
