import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

export const getFeaturedCategories = async (limit?: number, offset?: number, searchTerm?: string): Promise<any[]> => {
    let query = `
        SELECT fc.*, c.name AS category_name, c.description AS category_description, 
               f.name AS food_name, f.price, f.discount_price, f.description AS food_description,
               f.weightage AS food_weightage, f.category_id AS food_category_id
        FROM featured_categories AS fc
        JOIN categories AS c ON fc.category_id = c.id
        JOIN foods AS f ON fc.category_id = f.category_id
    `;

    if (searchTerm) {
        query += `
            WHERE c.name LIKE ? OR f.name LIKE ? OR f.description LIKE ?
        `;
    }

    query += `
        ORDER BY fc.created_at DESC
        LIMIT ? OFFSET ?;
    `;
    const params: any[] = [];
    if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    params.push(limit, offset);

    const [rows]: [RowDataPacket[], any] = await db.promise().query(query, params);
    return rows;
};


export const getCountOfFeaturedCategories = async (): Promise<number> => {
    const query = `SELECT COUNT(*) AS count FROM featured_categories;`;
    const [rows]: [RowDataPacket[], any] = await db.promise().query(query);
    return rows[0].count;
};
