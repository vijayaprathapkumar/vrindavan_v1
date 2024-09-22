import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all product types
export const getAllProductTypes = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM product_types");
  return rows;
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
export const getProductTypeById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM product_types WHERE id = ?", [id]);
  return rows;
};

// Update product type by ID
export const updateProductTypeById = async (id: number, name: string, weightage: number, active: number): Promise<void> => {
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
