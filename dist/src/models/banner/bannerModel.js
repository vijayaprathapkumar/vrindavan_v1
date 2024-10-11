"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBannerById = exports.updateBanner = exports.getBannerById = exports.createBanner = exports.getAllBanners = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all banners
const getAllBanners = async (page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    let query = `
    SELECT
      id AS banner_id,
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
      created_at,
      updated_at
    FROM
      banners
    WHERE
      id IS NOT NULL
  `;
    const params = [];
    if (searchTerm) {
        query += ` AND banner_name LIKE ?`;
        params.push(`%${searchTerm}%`);
    }
    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    const totalCountQuery = `
    SELECT COUNT(*) AS total 
    FROM banners 
    ${searchTerm ? "WHERE banner_name LIKE ?" : ""};
  `;
    const countParams = [];
    if (searchTerm)
        countParams.push(`%${searchTerm}%`);
    const [totalCountRows] = await databaseConnection_1.db.promise().query(totalCountQuery, countParams);
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
        throw error; // Handle error as needed
    }
};
exports.createBanner = createBanner;
// Fetch banner by ID
const getBannerById = async (id) => {
    const query = `
    SELECT 
      id AS banner_id,
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
      created_at,
      updated_at
    FROM 
      banners
    WHERE 
      id = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    return {
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
    const [result] = await databaseConnection_1.db.promise().query(updateBannerQuery, values);
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
