import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all FAQ categories
export const getAllFaqCategories = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = "",
  sortField: string,
  sortOrder: string
): Promise<{ faqCategories: RowDataPacket[]; total: number }> => {
  const offset = (page - 1) * limit;

  const validSortFields: Record<string, string> = {
    name: "faq_categories.name",
    weightage: "CAST(faq_categories.weightage AS UNSIGNED)",
    updated_at: "faq_categories.updated_at",
  };

  const sortColumn = validSortFields[sortField] || validSortFields.name;

  const validSortOrder = sortOrder === "desc" ? "desc" : "asc";

  const searchQuery = `
    SELECT id, name, weightage, created_at, updated_at 
    FROM faq_categories
    WHERE name LIKE ? OR CAST(faq_categories.weightage AS UNSIGNED) LIKE ?
    ORDER BY ${sortColumn} ${validSortOrder}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(searchQuery, [`%${searchTerm}%`,`%${searchTerm}%`, limit, offset]);

  const totalQuery = `
    SELECT COUNT(*) AS total 
    FROM faq_categories
    WHERE name LIKE ?
  `;

  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(totalQuery, [`%${searchTerm}%`,`%${searchTerm}%`]);

  return { faqCategories: rows, total };
};

// Create a new FAQ category
export const createFaqCategory = async (
  name: string,
  weightage: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO faq_categories (name, weightage,created_at,updated_at) VALUES (?, ?,NOW(),NOW())",
      [name, weightage]
    );
};

// Fetch FAQ category by ID
export const getFaqCategoryById = async (
  id: number
): Promise<RowDataPacket | null> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(
      "SELECT id, name, weightage, created_at, updated_at FROM faq_categories WHERE id = ?",
      [id]
    );
  return rows.length > 0 ? rows[0] : null;
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
      "UPDATE faq_categories SET name = ?, weightage = ?, updated_at = NOW() WHERE id = ?",
      [name, weightage, id]
    );
};

// Delete FAQ category by ID
export const deleteFaqCategoryById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM faq_categories WHERE id = ?", [id]);
};
