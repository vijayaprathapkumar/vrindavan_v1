"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountOfFeaturedCategories = exports.getFeaturedCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getFeaturedCategories = async (limit, offset) => {
    const query = `
        SELECT fc.*, c.name AS category_name, c.description AS category_description
        FROM featured_categories AS fc
        JOIN categories AS c ON fc.category_id = c.id
        ORDER BY fc.created_at DESC
        LIMIT ? OFFSET ?;
    `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [limit, offset]);
    return rows;
};
exports.getFeaturedCategories = getFeaturedCategories;
const getCountOfFeaturedCategories = async () => {
    const query = `SELECT COUNT(*) AS count FROM featured_categories;`;
    const [rows] = await databaseConnection_1.db.promise().query(query);
    return rows[0].count;
};
exports.getCountOfFeaturedCategories = getCountOfFeaturedCategories;
