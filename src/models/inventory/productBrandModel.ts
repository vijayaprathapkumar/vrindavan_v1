import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all product brands
export const getAllBrands = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM product_brands");
  return rows;
};

// Create a new product brand (with optional 'active' status)
export const createBrand = async (name: string, active: boolean): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO product_brands (name, active) VALUES (?, ?)",
      [name, active]
    );
};

// Update product brand by ID (with optional 'active' status)
export const updateBrandById = async (id: number, name: string, active: boolean): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE product_brands SET name = ?, active = ? WHERE id = ?",
      [name, active, id]
    );
};

// Delete product brand by ID
export const deleteBrandById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM product_brands WHERE id = ?", [id]);
};

// Fetch product brand by ID
export const getBrandById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM product_brands WHERE id = ?", [id]);
  return rows;
};
