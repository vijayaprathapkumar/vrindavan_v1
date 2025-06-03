"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeaturedCategory = exports.getFeaturedCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getFeaturedCategories = async (limit, offset, searchTerm) => {
    let countQuery = `
        SELECT COUNT(*) AS totalItems
        FROM featured_categories AS fc
        JOIN categories AS c ON fc.category_id = c.id
        JOIN foods AS f 
          ON fc.category_id = f.category_id 
          AND (fc.sub_category_id = 11 OR fc.sub_category_id IS NULL OR fc.sub_category_id = f.subcategory_id)
        LEFT JOIN media AS m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    `;
    if (searchTerm) {
        countQuery += `
            WHERE c.name LIKE ? OR f.name LIKE ? OR f.description LIKE ?
        `;
    }
    let query = `
        SELECT fc.*, c.name AS category_name, c.description AS category_description, 
               f.*,
                CASE 
                WHEN m.conversions_disk = 'public1' 
                THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
                ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
              END AS original_url
        FROM featured_categories AS fc
        JOIN categories AS c ON fc.category_id = c.id
        JOIN foods AS f 
          ON fc.category_id = f.category_id 
          AND (fc.sub_category_id = 11 OR fc.sub_category_id IS NULL OR fc.sub_category_id = f.subcategory_id)
        LEFT JOIN media AS m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
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
    const params = [];
    if (searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    params.push(limit, offset);
    const [countRows] = await databaseConnection_1.db
        .promise()
        .query(countQuery, params.slice(0, 3));
    const totalItems = countRows[0]?.totalItems || 0;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, params);
    return {
        totalItems,
        data: rows,
    };
};
exports.getFeaturedCategories = getFeaturedCategories;
const createFeaturedCategory = async (data) => {
    const { category_id, sub_category_id, status, category_type } = data;
    // Insert the new featured category
    const insertQuery = `
      INSERT INTO featured_categories (category_id, sub_category_id, status, category_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW());
  `;
    const insertParams = [
        category_id,
        sub_category_id || null,
        status,
        category_type || null,
    ];
    const [insertResult] = await databaseConnection_1.db
        .promise()
        .query(insertQuery, insertParams);
    // Delete all data from the featured_categories table
    const deleteQuery = `DELETE FROM featured_categories WHERE id != ?`;
    const deleteParams = [insertResult.insertId];
    await databaseConnection_1.db.promise().query(deleteQuery, deleteParams);
    return {
        id: insertResult.insertId,
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
    };
};
exports.createFeaturedCategory = createFeaturedCategory;
