import { db } from '../config/databaseConnection';
import { RowDataPacket, OkPacket } from 'mysql2';

export const getAllBrands = async (): Promise<RowDataPacket[]> => {
    const [rows] = await db.promise().query<RowDataPacket[]>('SELECT * FROM ProductBrands');
    return rows;
};

export const createBrand = async (name: string): Promise<void> => {
    await db.promise().query<OkPacket>('INSERT INTO ProductBrands (Name, Active) VALUES (?, TRUE)', [name]);
};
