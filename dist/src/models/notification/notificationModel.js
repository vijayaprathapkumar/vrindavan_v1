"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logNotificationSend = exports.deleteNotificationById = exports.updateNotification = exports.getNotificationById = exports.createNotification = exports.getAllNotifications = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllNotifications = async (page, limit, searchTerm, sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    let query = `
        SELECT
          un.id,
          un.notification_type,
          un.title,
          un.description,
          un.user_id,
          un.product_id,
          un.is_global,
          un.notification_send,
          un.created_at,
          un.updated_at,
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
            THEN  CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/notification/', m.file_name)
            ELSE CONCAT(
                'https://vrindavanmilk.com/storage/app/public/', m.id, '/conversions/',
                REPLACE(REPLACE(SUBSTRING_INDEX(m.file_name, '-icon', 1), '.png', ''), '.jpg', ''), 
                '-icon.jpg'
            )
          END AS original_url
        FROM user_notifications un
        LEFT JOIN media m ON un.id = m.model_id 
          AND (m.model_type = 'App\\\\Models\\\\UserNotification')
        WHERE 1=1
    `;
    const params = [];
    if (searchTerm) {
        const notificationType = mapNotificationType(searchTerm);
        if (notificationType !== -1) {
            query += ` AND un.notification_type = ?`;
            params.push(notificationType);
        }
        else {
            query += ` AND (un.title LIKE ? OR un.description LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }
    }
    const validSortFields = {
        id: "un.id",
        notification_type: "un.notification_type",
        title: "un.title",
        description: "un.description",
        createdAt: "un.created_at",
    };
    const sortColumn = sortField && validSortFields[sortField]
        ? validSortFields[sortField]
        : "un.created_at";
    const order = sortOrder === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, params);
    const totalCountQuery = `
      SELECT COUNT(*) AS total
      FROM user_notifications un
      WHERE 1=1 ${searchTerm ? "AND (un.title LIKE ? OR un.description LIKE ?)" : ""};
    `;
    const totalCountParams = searchTerm
        ? [`%${searchTerm}%`, `%${searchTerm}%`]
        : [];
    const [totalCountRows] = await databaseConnection_1.db
        .promise()
        .query(totalCountQuery, totalCountParams);
    const totalCount = totalCountRows[0]?.total || 0;
    return {
        notifications: rows.map((row) => ({
            id: row.id,
            notification_type: row.notification_type,
            title: row.title,
            description: row.description,
            user_id: row.user_id,
            product_id: row.product_id,
            is_global: row.is_global,
            notification_send: row.notification_send,
            created_at: row.created_at,
            updated_at: row.updated_at,
            media: {
                mediaId: row.media_id,
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
exports.getAllNotifications = getAllNotifications;
const mapNotificationType = (searchTerm) => {
    const notificationTypeMap = {
        "Text Notifications": 1,
        "Product Notifications": 2,
    };
    const matchedKey = Object.keys(notificationTypeMap).find((key) => key.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchedKey ? notificationTypeMap[matchedKey] : -1;
};
// Create a new notification
const createNotification = async (notificationData) => {
    const { notification_type, title, description, user_id, product_id, is_global, notification_send = 0, } = notificationData;
    const sql = `
    INSERT INTO user_notifications 
    (notification_type, title, description, user_id, product_id, is_global, notification_send, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const values = [
        notification_type,
        title,
        description,
        user_id,
        product_id,
        is_global,
        notification_send,
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result.insertId;
    }
    catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};
exports.createNotification = createNotification;
// Fetch notification by ID
const getNotificationById = async (id) => {
    const query = `
      SELECT
          un.id,
          un.notification_type,
          un.title,
          un.description,
          un.user_id,
          un.product_id,
          un.is_global,
          un.notification_send,
          un.created_at,
          un.updated_at,
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
            THEN  CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/notification/', m.file_name)
            ELSE CONCAT(
                'https://vrindavanmilk.com/storage/app/public/', m.id, '/conversions/',
                REPLACE(REPLACE(SUBSTRING_INDEX(m.file_name, '-icon', 1), '.png', ''), '.jpg', ''), 
                '-icon.jpg'
            )
          END AS original_url
        FROM user_notifications un
         LEFT JOIN media m ON un.id = m.model_id 
          AND (m.model_type = 'App\\\\Models\\\\UserNotification')
      LEFT JOIN user_notification_logs ul ON un.id = ul.user_notification_id 
      WHERE un.id = ? 
      ORDER BY un.created_at DESC;
    `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, [id]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    return {
        id: row.id,
        notification_type: row.notification_type,
        title: row.title,
        description: row.description,
        user_id: row.user_id,
        product_id: row.product_id,
        is_global: row.is_global,
        notification_send: row.notification_send,
        created_at: row.created_at,
        updated_at: row.updated_at,
        original_url: row.original_url,
        media: {
            mediaId: row.media_id,
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
    };
};
exports.getNotificationById = getNotificationById;
// Update notification by ID
const updateNotification = async (id, notificationData) => {
    const { notification_type, title, description, user_id, product_id, is_global, notification_send, } = notificationData;
    const updateQuery = `
    UPDATE user_notifications 
    SET 
      notification_type = COALESCE(?, notification_type),
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      user_id = COALESCE(?, user_id),
      product_id = COALESCE(?, product_id),
      is_global = COALESCE(?, is_global),
      notification_send = COALESCE(?, notification_send),
      updated_at = NOW()
    WHERE 
      id = ?;
  `;
    const values = [
        notification_type,
        title,
        description,
        user_id,
        product_id,
        is_global,
        notification_send,
        id,
    ];
    const [result] = await databaseConnection_1.db
        .promise()
        .query(updateQuery, values);
    return { affectedRows: result.affectedRows };
};
exports.updateNotification = updateNotification;
// Delete notification by ID
const deleteNotificationById = async (id) => {
    const query = `
    DELETE FROM user_notifications 
    WHERE id = ?;
  `;
    const [result] = await databaseConnection_1.db.promise().query(query, [id]);
    return { affectedRows: result.affectedRows };
};
exports.deleteNotificationById = deleteNotificationById;
// Log notification sending
const logNotificationSend = async (user_notification_id) => {
    const query = `
    INSERT INTO user_notification_logs (user_notification_id, notification_sent_date, created_at, updated_at)
    VALUES (?, NOW(), NOW(), NOW());
  `;
    await databaseConnection_1.db.promise().query(query, [user_notification_id]);
};
exports.logNotificationSend = logNotificationSend;
