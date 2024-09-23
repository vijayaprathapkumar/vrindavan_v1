import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllProductTypes = async (
  searchTerm: string,
  limit: number,
  offset: number
): Promise<{ total: number; rows: RowDataPacket[] }> => {
  // Query to get the total count of records
  const countQuery = `
    SELECT COUNT(*) as total FROM product_types
    WHERE Name LIKE ? OR Weightage LIKE ? OR Active LIKE ?
  `;
  let activeValue: number | null = null;

  if (searchTerm.toLowerCase() === "true") {
    activeValue = 1;
  } else if (searchTerm.toLowerCase() === "false") {
    activeValue = 0; 
  }

  const [countResult] = await db
    .promise()
    .query<RowDataPacket[]>(countQuery, [
      `%${searchTerm}%`,
      `${searchTerm}`,
      activeValue,
    ]);

  const total = countResult[0].total; // Get the total count

  // Fetch the actual records
  const query = `
    SELECT * FROM product_types
    WHERE Name LIKE ? OR Weightage LIKE ? OR Active LIKE ?
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(query, [
      `%${searchTerm}%`,
      `${searchTerm}`,
      activeValue,
      limit,
      offset,
    ]);

  return { total, rows };
};

// Create a new product type
export const createProductType = async (
  name: string,
  weightage: number,
  active: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO product_types (Name, Weightage, Active) VALUES (?, ?, ?)",
      [name, weightage, active]
    );
};

// Fetch product type by ID
export const getProductTypeById = async (
  id: number
): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM product_types WHERE id = ?", [id]);
  return rows;
};

// Update product type by ID
export const updateProductTypeById = async (
  id: number,
  name: string,
  weightage: number,
  active: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE product_types SET Name = ?, Weightage = ?, Active = ? WHERE id = ?",
      [name, weightage, active, id]
    );
};

// Delete product type by ID
export const deleteProductTypeById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM product_types WHERE id = ?", [id]);
};
