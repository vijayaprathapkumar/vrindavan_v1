import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

export const getFeaturedCategories = async (limit?: number, offset?: number): Promise<any[]> => {
    const query = `
        SELECT fc.*, c.name AS category_name, c.description AS category_description
        FROM featured_categories AS fc
        JOIN categories AS c ON fc.category_id = c.id
        ORDER BY fc.created_at DESC
        LIMIT ? OFFSET ?;
    `;
    
    const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [limit, offset]);
    return rows;
};

export const getCountOfFeaturedCategories = async (): Promise<number> => {
    const query = `SELECT COUNT(*) AS count FROM featured_categories;`;
    const [rows]: [RowDataPacket[], any] = await db.promise().query(query);
    return rows[0].count;
};
