import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllSubcategories = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM Subcategories");
  return rows;
};

export const createSubcategory = async (
  name: string,
  categoryID: number,
  description: string,
  weightage: number,
  image: string
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO Subcategories (Name, CategoryID, Description, Weightage, Image) VALUES (?, ?, ?, ?, ?)",
      [name, categoryID, description, weightage, image]
    );
};

export const getSubcategoryById = async (
  id: number
): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(
      "SELECT * FROM Subcategories WHERE SubcategoryID = ?",
      [id]
    );
  return rows;
};

export const updateSubcategoryById = async (
  id: number,
  name: string,
  categoryID: number,
  description: string,
  weightage: number,
  image: string
): Promise<OkPacket> => {
  const [result] = await db
    .promise()
    .query<OkPacket>(
      "UPDATE Subcategories SET Name = ?, CategoryID = ?, Description = ?, Weightage = ?, Image = ? WHERE SubcategoryID = ?",
      [name, categoryID, description, weightage, image, id]
    );
  return result;
};

export const deleteSubcategoryById = async (
  id: number
): Promise<OkPacket> => {
  const [result] = await db
    .promise()
    .query<OkPacket>("DELETE FROM Subcategories WHERE SubcategoryID = ?", [id]);
  return result;
};
