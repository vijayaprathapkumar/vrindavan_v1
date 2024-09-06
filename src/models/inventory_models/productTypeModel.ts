import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllProductTypes = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM ProductTypes");
  return rows;
};

export const createProductType = async (
  name: string,
  weightage: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO ProductTypes (Name, Weightage, Active) VALUES (?, ?, TRUE)",
      [name, weightage]
    );
};

export const getProductTypeById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM ProductTypes WHERE ProductTypeID = ?", [id]);
  return rows;
};

export const updateProductTypeById = async (id: number, name: string, weightage: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE ProductTypes SET Name = ?, Weightage = ? WHERE ProductTypeID = ?",
      [name, weightage, id]
    );
};

export const deleteProductTypeById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM ProductTypes WHERE ProductTypeID = ?", [id]);
};
