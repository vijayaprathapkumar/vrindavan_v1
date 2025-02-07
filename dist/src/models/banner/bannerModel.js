"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBannerById = exports.updateBanner = exports.getBannerById = exports.createBanner = exports.getAllBanners = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all banners
const getAllBanners = async (page, limit, searchTerm, sortField, sortOrder) => {
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
      CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/banners/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM
      banners b
    LEFT JOIN media m ON b.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Banner'
    WHERE
      b.id IS NOT NULL
    AND (b.date_to IS NULL OR b.date_to >= CURDATE())
  `;
    const params = [];
    if (searchTerm) {
        const bannerType = mapBannerType(searchTerm);
        const bannerLocation = mapBannerLocation(searchTerm);
        if (bannerType !== -1) {
            query += ` AND b.banner_type = ?`;
            params.push(bannerType);
        }
        else if (bannerLocation !== -1) {
            query += ` AND b.banner_location = ?`;
            params.push(bannerLocation);
        }
        else {
            query += ` AND b.banner_name LIKE ?`;
            params.push(`%${searchTerm}%`);
        }
    }
    const validSortFields = {
        banner_name: "b.banner_name",
        banner_type: "b.banner_type",
        banner_location: "b.banner_location",
        date_from: "b.date_from",
        date_to: "b.date_to",
        banner_weightage: "CAST(b.banner_weightage AS UNSIGNED)",
        status: "b.status",
        created_at: "b.created_at",
        updated_at: "b.updated_at",
    };
    query += ` ORDER BY ${validSortFields[sortField] || "b.banner_weightage"} ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, params);
    const totalCountQuery = `
    SELECT COUNT(*) AS total 
    FROM banners b
    ${searchTerm
        ? "WHERE (b.banner_name LIKE ? OR b.banner_type = ? OR b.banner_location = ?)"
        : ""};
  `;
    const countParams = [];
    if (searchTerm)
        countParams.push(`%${searchTerm}%`, mapBannerType(searchTerm), mapBannerLocation(searchTerm));
    const [totalCountRows] = await databaseConnection_1.db
        .promise()
        .query(totalCountQuery, countParams);
    const totalCount = totalCountRows[0]?.total || 0;
    const banners = await Promise.all(rows.map(async (row) => {
        const foodIds = row.food_id
            ? row.food_id.split(",").map((id) => parseInt(id.trim()))
            : [];
        let foodItems = [];
        if (foodIds.length > 0) {
            const [foodRows] = await databaseConnection_1.db.promise().query(`SELECT 
            f.*, 
            m.id AS media_id,
            m.model_type,
            m.model_id,
            m.uuid,
            m.collection_name,
            m.name AS media_name,
            m.file_name AS media_file_name,
            m.mime_type AS media_mime_type,
            CASE 
              WHEN m.conversions_disk = 'public1' 
              THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/banners/', m.file_name)
              ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
            END AS original_url
          FROM foods f
          LEFT JOIN media m ON f.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Food')
          WHERE f.id IN (${foodIds.map(() => "?").join(", ")})
          `, foodIds);
            foodItems = foodRows;
        }
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
            foods: foodItems,
        };
    }));
    return {
        banners,
        total: totalCount,
    };
};
exports.getAllBanners = getAllBanners;
const mapBannerType = (searchTerm) => {
    const bannerTypeMap = {
        "Non Clickable": 1,
        "Product Based": 2,
        "Category Based": 3,
        "Sub Category Based": 4,
        "Content Based": 5,
    };
    const matchedKey = Object.keys(bannerTypeMap).find((key) => key.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchedKey ? bannerTypeMap[matchedKey] : -1;
};
const mapBannerLocation = (searchTerm) => {
    const bannerLocationMap = {
        "Home Top": 1,
        "Home Bottom": 2,
    };
    const matchedKey = Object.keys(bannerLocationMap).find((key) => key.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchedKey ? bannerLocationMap[matchedKey] : -1;
};
// Create a new banner
const createBanner = async (bannerData) => {
    const { banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, } = bannerData;
    console.log('bannerData', bannerData);
    // Convert food_id array to comma-separated string, or null if empty
    const foodIdString = food_id && food_id.length > 0 ? food_id.join(',') : null;
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
        banner_content ?? null,
        foodIdString, // Insert the comma-separated food_id string
        banner_weightage,
        date_from,
        date_to,
        status,
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        console.log('result', result);
        return result.insertId;
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
    CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/banners/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM 
      banners b
    LEFT JOIN media m ON b.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Food' OR m.model_type = 'AppModelsBanner')
    WHERE 
      b.id = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    const foodIds = row.food_id
        ? row.food_id.split(",").map((id) => parseInt(id.trim()))
        : [];
    let foodItems = [];
    if (foodIds.length > 0) {
        const [foodRows] = await databaseConnection_1.db.promise().query(`
        SELECT 
          f.*, 
          m.id AS media_id,
          m.model_type,
          m.model_id,
          m.uuid,
          m.collection_name,
          m.name AS media_name,
          m.file_name AS media_file_name,
          m.mime_type AS media_mime_type,
          CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS food_image_url
        FROM foods f
        LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
        WHERE f.id IN (${foodIds.map(() => "?").join(", ")})
      `, foodIds);
        foodItems = foodRows;
    }
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
        foods: foodItems.length > 0 ? foodItems : null,
    };
};
exports.getBannerById = getBannerById;
// Update banner by ID
const updateBanner = async (id, banner_name, banner_type, banner_location, banner_link, banner_content, food_id, // Change to an array of strings
banner_weightage, date_from, date_to, status) => {
    // Convert food_id array to a comma-separated string if it's provided
    const foodIdString = food_id && food_id.length > 0 ? food_id.join(',') : undefined;
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
        foodIdString, // Use the converted comma-separated food_id string
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
