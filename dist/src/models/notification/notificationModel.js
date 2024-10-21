"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logNotificationSend = exports.deleteNotificationById = exports.updateNotification = exports.getNotificationById = exports.createNotification = exports.getAllNotifications = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Get all notifications
const getAllNotifications = async (page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    const searchCondition = searchTerm
        ? `AND (un.title LIKE ? OR un.description LIKE ?)`
        : "";
    const query = `
      SELECT
        un.id,
        CASE un.notification_type
          WHEN 1 THEN 'Notifications'
          WHEN 2 THEN 'Product Notifications'
        END AS notification_type,
        un.title,
        un.description,
        un.user_id,
        un.product_id,
        un.is_global,
        un.notification_send,
        un.created_at,
        un.updated_at,
        GROUP_CONCAT(CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)) AS original_url,
        GROUP_CONCAT(ul.id) AS log_ids,  
        GROUP_CONCAT(ul.notification_sent_date) AS notification_sent_dates  
      FROM user_notifications un
      LEFT JOIN media m ON un.product_id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
      LEFT JOIN user_notification_logs ul ON un.id = ul.user_notification_id  
      WHERE 1=1 ${searchCondition}  
      GROUP BY un.id
      ORDER BY un.created_at DESC
      LIMIT ? OFFSET ?;
    `;
    // If searchTerm exists, use it in the query
    const queryParams = searchTerm
        ? [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset]
        : [limit, offset];
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, queryParams);
    const totalCountQuery = `
      SELECT COUNT(*) AS total
      FROM user_notifications un
      WHERE 1=1 ${searchCondition};  -- Add search condition in total count query
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
            original_url: row.original_url,
            notifications_log_ids: row.log_ids,
            notification_sent_dates: row.notification_sent_dates,
        })),
        total: totalCount,
    };
};
exports.getAllNotifications = getAllNotifications;
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
        return result;
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
        CASE un.notification_type
          WHEN 1 THEN 'Notifications'
          WHEN 2 THEN 'Product Notifications'
        END AS notification_type,
        un.title,
        un.description,
        un.user_id,
        un.product_id,
        un.is_global,
        un.notification_send,
        un.created_at,
        un.updated_at,
        GROUP_CONCAT(CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)) AS original_url,
        GROUP_CONCAT(ul.id) AS log_ids,  
        GROUP_CONCAT(ul.notification_sent_date) AS notification_sent_dates  
      FROM user_notifications un
      LEFT JOIN media m ON un.product_id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
      LEFT JOIN user_notification_logs ul ON un.id = ul.user_notification_id 
      WHERE un.id = ? 
      GROUP BY un.id
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
        notifications_log_ids: row.log_ids,
        notification_sent_dates: row.notification_sent_dates,
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
