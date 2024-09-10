import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all categories
export const getAllCategories = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM Categories");
  return rows;
};

// Create a new category
export const createCategory = async (
  name: string,
  description: string,
  weightage: number,
  image: string
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO Categories (Name, Description, Weightage, Image) VALUES (?, ?, ?, ?)",
      [name, description, weightage, image]
    );
};

// Fetch category by ID
export const getCategoryById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM Categories WHERE CategoryID = ?", [id]);
  return rows;
};

// Update category by ID
export const updateCategoryById = async (
  id: number,
  name: string,
  description: string,
  weightage: number,
  image: string
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE Categories SET Name = ?, Description = ?, Weightage = ?, Image = ? WHERE CategoryID = ?",
      [name, description, weightage, image, id]
    );
};

// Delete category by ID
export const deleteCategoryById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM Categories WHERE CategoryID = ?", [id]);
};
