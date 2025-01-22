import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all FAQs
export const getAllFaqs = async (
  page: number = 1,
  limit: number = 10,
  searchTerm: string = "",
  faqCategoryId?: number,
  sortField?: string,
  sortOrder?: string
): Promise<{ faqs: RowDataPacket[]; total: number }> => {
  const offset = (page - 1) * limit;

  const validSortFields: Record<string, string> = {
    question: "f.question",
    answer: "f.answer",
    category_name: "fc.name",
    weightage: "CAST(f.weightage AS UNSIGNED)",
    updated_at: "f.updated_at",
  };

  const sortColumn = validSortFields[sortField] || validSortFields.question;

  const validSortOrder = sortOrder === "desc" ? "desc" : "asc";

  let whereClause = `
    WHERE 
      (f.question LIKE ? OR f.answer LIKE ? OR fc.name LIKE ?)
  `;
  const queryParams: (string | number)[] = [
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    limit,
    offset,
  ];

  if (faqCategoryId) {
    whereClause += ` AND f.faq_category_id = ?`;
    queryParams.splice(3, 0, faqCategoryId);
  }

  const searchQuery = `
    SELECT
      f.id,
      f.question,
      f.answer,
      f.weightage,
      f.faq_category_id,
      fc.name AS category_name,
      f.created_at,
      f.updated_at
    FROM faqs f
    LEFT JOIN faq_categories fc ON f.faq_category_id = fc.id
    ${whereClause}
   ORDER BY ${sortColumn} ${validSortOrder}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(searchQuery, queryParams);

  const totalQuery = `
    SELECT COUNT(*) AS total
    FROM faqs f
    LEFT JOIN faq_categories fc ON f.faq_category_id = fc.id
    ${whereClause.replace("LIMIT ? OFFSET ?", "")}  -- Exclude limit/offset
  `;

  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(
      totalQuery,
      queryParams.slice(0, faqCategoryId ? 4 : 3)
    );

  return { faqs: rows, total };
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
      "INSERT INTO faqs (question, answer, faq_category_id, weightage,created_at,updated_at) VALUES (?, ?, ?, ?,NOW(),NOW())",
      [question, answer, faqCategoryId, weightage]
    );
};

// Fetch FAQ by ID
export const getFaqById = async (id: number): Promise<RowDataPacket | null> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    `
      SELECT    
        f.id, 
        f.question, 
        f.answer, 
        f.weightage,
        f.faq_category_id, 
        fc.name AS category_name, 
        f.created_at, 
        f.updated_at
      FROM faqs f 
      LEFT JOIN faq_categories fc ON f.faq_category_id = fc.id
      WHERE f.id = ?
    `,
    [id]
  );

  return rows.length > 0 ? rows[0] : null;
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
  await db.promise().query<OkPacket>("DELETE FROM faqs WHERE id = ?", [id]);
};
