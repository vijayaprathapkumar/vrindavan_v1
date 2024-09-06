import { db } from '../config/databaseConnection';
import { RowDataPacket, OkPacket } from 'mysql2';

export const getAllSubcategories = async (): Promise<RowDataPacket[]> => {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Subcategories');
    return rows;
};

export const createSubcategory = async (name: string, categoryID: number, description: string, weightage: number, image: string): Promise<void> => {
    await db.promise().query<OkPacket>(
        'INSERT INTO Subcategories (Name, CategoryID, Description, Weightage, Image) VALUES (?, ?, ?, ?, ?)', 
        [name, categoryID, description, weightage, image]
    );
};

export const getSubcategoryById = async (id: number): Promise<RowDataPacket[]> => {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Subcategories WHERE SubcategoryID = ?', [id]);
    return rows;
};
