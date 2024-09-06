import { db } from '../config/databaseConnection';
import { RowDataPacket, OkPacket } from 'mysql2';

export const getAllCategories = async (): Promise<RowDataPacket[]> => {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Categories');
    return rows;
};

export const createCategory = async (name: string, description: string, weightage: number, image: string): Promise<void> => {
    await db.promise().query<OkPacket>(
        'INSERT INTO Categories (Name, Description, Weightage, Image) VALUES (?, ?, ?, ?)', 
        [name, description, weightage, image]
    );
};

export const getCategoryById = async (id: number): Promise<RowDataPacket[]> => {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT * FROM Categories WHERE CategoryID = ?', [id]);
    return rows;
};
