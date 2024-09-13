import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllProductTypes = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM product_types");
  return rows;
};

export const createProductType = async (
  name: string,
  weightage: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO product_types (Name, Weightage, Active) VALUES (?, ?, TRUE)",
      [name, weightage]
    );
};

export const getProductTypeById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM product_types WHERE ProductTypeID = ?", [id]);
  return rows;
};

export const updateProductTypeById = async (id: number, name: string, weightage: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE product_types SET Name = ?, Weightage = ? WHERE ProductTypeID = ?",
      [name, weightage, id]
    );
};

export const deleteProductTypeById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM product_types WHERE ProductTypeID = ?", [id]);
};
