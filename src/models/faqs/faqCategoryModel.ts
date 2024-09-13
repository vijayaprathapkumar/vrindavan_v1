import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all FAQ categories
export const getAllFaqCategories = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT id, name, weightage FROM faq_categories");
  return rows;
};

// Create a new FAQ category
export const createFaqCategory = async (name: string, weightage: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO faq_categories (name, weightage) VALUES (?, ?)",
      [name, weightage]
    );
};

// Fetch FAQ category by ID
export const getFaqCategoryById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT id, name, weightage FROM faq_categories WHERE id = ?", [id]);
  return rows;
};

// Update FAQ category by ID
export const updateFaqCategoryById = async (
  id: number,
  name: string,
  weightage: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE faq_categories SET name = ?, weightage = ? WHERE id = ?",
      [name, weightage, id]
    );
};

// Delete FAQ category by ID
export const deleteFaqCategoryById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM faq_categories WHERE id = ?", [id]);
};
