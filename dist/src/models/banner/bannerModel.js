"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBannerById = exports.updateBanner = exports.getBannerById = exports.createBanner = exports.getAllBanners = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all banners
const getAllBanners = async (page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    let query = `
    SELECT
      b.id AS banner_id,
      b.banner_name,
      b.banner_type,
      b.banner_location,
      b.banner_link,
      b.banner_content,
      b.food_id,
      b.banner_weightage,
      b.date_from,
      b.date_to,
      b.status,
      b.created_at,
      b.updated_at,
      m.id AS media_id,
      m.model_type,
      m.model_id,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM
      banners b
    LEFT JOIN media m ON b.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Banner'
    WHERE
      b.id IS NOT NULL
  `;
    const params = [];
    if (searchTerm) {
        query += ` AND b.banner_name LIKE ?`;
        params.push(`%${searchTerm}%`);
    }
    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, params);
    const totalCountQuery = `
    SELECT COUNT(*) AS total 
    FROM banners b
    ${searchTerm ? "WHERE b.banner_name LIKE ?" : ""};
  `;
    const countParams = [];
    if (searchTerm)
        countParams.push(`%${searchTerm}%`);
    const [totalCountRows] = await databaseConnection_1.db
        .promise()
        .query(totalCountQuery, countParams);
    const totalCount = totalCountRows[0]?.total || 0;
    return {
        banners: rows.map((row) => ({
            id: row.banner_id,
            banner_name: row.banner_name,
            banner_type: row.banner_type,
            banner_location: row.banner_location,
            banner_link: row.banner_link,
            banner_content: row.banner_content,
            food_id: row.food_id,
            banner_weightage: row.banner_weightage,
            date_from: row.date_from,
            date_to: row.date_to,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            media: {
                id: row.media_id,
                model_type: row.model_type,
                model_id: row.model_id,
                uuid: row.uuid,
                collection_name: row.collection_name,
                name: row.media_name,
                file_name: row.file_name,
                mime_type: row.mime_type,
                disk: row.disk,
                conversions_disk: row.conversions_disk,
                size: row.size,
                manipulations: row.manipulations,
                custom_properties: row.custom_properties,
                generated_conversions: row.generated_conversions,
                responsive_images: row.responsive_images,
                order_column: row.order_column,
                created_at: row.media_created_at,
                updated_at: row.media_updated_at,
                original_url: row.original_url,
            },
        })),
        total: totalCount,
    };
};
exports.getAllBanners = getAllBanners;
// Create a new banner
const createBanner = async (bannerData) => {
    const { banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, } = bannerData;
    const sql = `
    INSERT INTO banners 
    (banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const values = [
        banner_name,
        banner_type,
        banner_location,
        banner_link,
        banner_content,
        food_id,
        banner_weightage,
        date_from,
        date_to,
        status,
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result;
    }
    catch (error) {
        console.error("Error creating banner:", error);
        throw error;
    }
};
exports.createBanner = createBanner;
// Fetch banner by ID
const getBannerById = async (id) => {
    const query = `
    SELECT 
      b.id AS banner_id,
      b.banner_name,
      b.banner_type,
      b.banner_location,
      b.banner_link,
      b.banner_content,
      b.food_id,
      b.banner_weightage,
      b.date_from,
      b.date_to,
      b.status,
      b.created_at,
      b.updated_at,
      m.id AS media_id,
      m.model_type,
      m.model_id,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      banners b
    LEFT JOIN media m ON b.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Banner'
    WHERE 
      b.id = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    return {
        banner: {
            id: row.banner_id,
            banner_name: row.banner_name,
            banner_type: row.banner_type,
            banner_location: row.banner_location,
            banner_link: row.banner_link,
            banner_content: row.banner_content,
            food_id: row.food_id,
            banner_weightage: row.banner_weightage,
            date_from: row.date_from,
            date_to: row.date_to,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
        },
        media: row.media_id
            ? {
                id: row.media_id,
                model_type: row.model_type,
                model_id: row.model_id,
                uuid: row.uuid,
                collection_name: row.collection_name,
                name: row.media_name,
                file_name: row.file_name,
                mime_type: row.mime_type,
                disk: row.disk,
                conversions_disk: row.conversions_disk,
                size: row.size,
                manipulations: row.manipulations,
                custom_properties: row.custom_properties,
                generated_conversions: row.generated_conversions,
                responsive_images: row.responsive_images,
                order_column: row.order_column,
                created_at: row.media_created_at,
                updated_at: row.media_updated_at,
                original_url: row.original_url,
            }
            : null,
    };
};
exports.getBannerById = getBannerById;
// Update banner by ID
const updateBanner = async (id, banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status) => {
    const updateBannerQuery = `
    UPDATE banners 
    SET 
      banner_name = COALESCE(?, banner_name),
      banner_type = COALESCE(?, banner_type),
      banner_location = COALESCE(?, banner_location),
      banner_link = COALESCE(?, banner_link),
      banner_content = COALESCE(?, banner_content),
      food_id = COALESCE(?, food_id),
      banner_weightage = COALESCE(?, banner_weightage),
      date_from = COALESCE(?, date_from),
      date_to = COALESCE(?, date_to),
      status = COALESCE(?, status),
      updated_at = NOW()
    WHERE 
      id = ?;
  `;
    const values = [
        banner_name,
        banner_type,
        banner_location,
        banner_link,
        banner_content,
        food_id,
        banner_weightage,
        date_from,
        date_to,
        status,
        id,
    ];
    const [result] = await databaseConnection_1.db
        .promise()
        .query(updateBannerQuery, values);
    return { affectedRows: result.affectedRows };
};
exports.updateBanner = updateBanner;
// Delete a banner by ID
const deleteBannerById = async (id) => {
    const query = `
    DELETE FROM banners 
    WHERE id = ?;
  `;
    const [result] = await databaseConnection_1.db.promise().query(query, [id]);
    return { affectedRows: result.affectedRows };
};
exports.deleteBannerById = deleteBannerById;
