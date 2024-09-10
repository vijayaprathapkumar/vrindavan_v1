import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all product brands
export const getAllBrands = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM ProductBrands");
  return rows;
};

// Create a new product brand
export const createBrand = async (name: string): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO ProductBrands (Name, Active) VALUES (?, TRUE)",
      [name]
    );
};

// Update product brand by ID
export const updateBrandById = async (id: number, name: string): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE ProductBrands SET Name = ? WHERE BrandID = ?",
      [name, id]
    );
};

// Delete product brand by ID
export const deleteBrandById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM ProductBrands WHERE BrandID = ?", [id]);
};

// Fetch product brand by ID
export const getBrandById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM ProductBrands WHERE BrandID = ?", [id]);
  return rows;
};

