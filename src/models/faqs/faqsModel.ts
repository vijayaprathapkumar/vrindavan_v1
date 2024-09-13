import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all FAQs
export const getAllFaqs = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM faqs");
  return rows;
};

// Create a new FAQ
export const createFaq = async (
  question: string,
  answer: string,
  faqCategoryId: number,
  weightage: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO faqs (question, answer, faq_category_id, weightage) VALUES (?, ?, ?, ?)",
      [question, answer, faqCategoryId, weightage]
    );
};

// Fetch FAQ by ID
export const getFaqById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM faqs WHERE id = ?", [id]);
  return rows;
};

// Update FAQ by ID
export const updateFaqById = async (
  id: number,
  question: string,
  answer: string,
  faqCategoryId: number,
  weightage: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE faqs SET question = ?, answer = ?, faq_category_id = ?, weightage = ? WHERE id = ?",
      [question, answer, faqCategoryId, weightage, id]
    );
};

// Delete FAQ by ID
export const deleteFaqById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM faqs WHERE id = ?", [id]);
};
