"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.deleteNotification = exports.updateNotificationController = exports.fetchNotificationById = exports.addNotification = exports.fetchNotifications = void 0;
const notificationModel_1 = require("../../models/notification/notificationModel");
const responseHandler_1 = require("../../utils/responseHandler");
const imageUploadController_1 = require("../imageUpload/imageUploadController");
const databaseConnection_1 = require("../../config/databaseConnection");
const firebaseAdmin_1 = __importDefault(require("../../config/firebase/firebaseAdmin"));
// Fetch all notifications
const fetchNotifications = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm
        ? String(req.query.searchTerm)
        : undefined;
    const sortField = req.query.sortField
        ? String(req.query.sortField)
        : undefined;
    const sortOrder = req.query.sortOrder
        ? String(req.query.sortOrder)
        : undefined;
    try {
        const { notifications, total } = await (0, notificationModel_1.getAllNotifications)(page, limit, searchTerm, sortField, sortOrder);
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Notifications fetched successfully.", {
            notifications,
            totalCount: total,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching notifications.", error.message));
    }
};
exports.fetchNotifications = fetchNotifications;
// Create a new notification
const addNotification = async (req, res) => {
    const { notification_type, title, description, user_id, product_id, is_global, media, } = req.body;
    try {
        const notificationId = await (0, notificationModel_1.createNotification)({
            notification_type,
            title,
            description,
            user_id,
            product_id,
            is_global,
        });
        if (media) {
            const { model_type, file_name, mime_type, size } = media;
            await (0, imageUploadController_1.insertMediaRecord)(model_type, notificationId, file_name, mime_type, size);
        }
        return res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Notification created successfully."));
    }
    catch (error) {
        console.error("Error creating notification:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating notification.", error.message));
    }
};
exports.addNotification = addNotification;
// Get a notification by ID
const fetchNotificationById = async (req, res) => {
    const notificationId = Number(req.params.id);
    if (isNaN(notificationId)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid notification ID."));
    }
    try {
        const notification = await (0, notificationModel_1.getNotificationById)(notificationId);
        if (!notification) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Notification not found."));
        }
        const responseNotification = { notification: [notification] };
        return res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Notification fetched successfully.", responseNotification));
    }
    catch (error) {
        console.error("Error fetching notification:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching notification.", error.message));
    }
};
exports.fetchNotificationById = fetchNotificationById;
// Update a notification by ID
const updateNotificationController = async (req, res) => {
    const notificationId = Number(req.params.id);
    const { media } = req.body;
    if (isNaN(notificationId)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid notification ID."));
    }
    try {
        const result = await (0, notificationModel_1.updateNotification)(notificationId, req.body);
        if (result.affectedRows > 0) {
            if (media && media.media_id) {
                const { media_id, file_name, mime_type, size } = media;
                await (0, imageUploadController_1.updateMediaRecord)(media_id, file_name, mime_type, size);
            }
            return res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Notification updated successfully."));
        }
        else {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Notification not found."));
        }
    }
    catch (error) {
        console.error("Error updating notification:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating notification.", error.message));
    }
};
exports.updateNotificationController = updateNotificationController;
// Delete a notification by ID
const deleteNotification = async (req, res) => {
    const notificationId = Number(req.params.id);
    if (isNaN(notificationId)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid notification ID."));
    }
    try {
        const result = await (0, notificationModel_1.deleteNotificationById)(notificationId);
        if (result.affectedRows > 0) {
            return res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Notification deleted successfully."));
        }
        else {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Notification not found."));
        }
    }
    catch (error) {
        console.error("Error deleting notification:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting notification.", error.message));
    }
};
exports.deleteNotification = deleteNotification;
// Send notification and log it
const sendNotification = async (req, res) => {
    const notificationId = Number(req.params.id);
    if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
    }
    const notification = await (0, notificationModel_1.getNotificationById)(notificationId);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    const message = {
        notification: {
            title: notification.title,
            body: notification.description,
            imageUrl: notification.original_url ?? undefined,
        },
        data: {
            notificationId: notificationId.toString(),
            imageUrl: notification.original_url ?? undefined,
        },
        topic: notification.is_global ? "global_notifications" : undefined,
        token: notification.is_global
            ? undefined
            : await getUserFcmToken(notification.user_id),
    };
    try {
        let response;
        if (message.token) {
            response = await firebaseAdmin_1.default.messaging().send({
                token: message.token,
                notification: message.notification,
                data: message.data,
            });
        }
        else if (message.topic) {
            response = await firebaseAdmin_1.default.messaging().send({
                topic: message.topic,
                notification: message.notification,
                data: message.data,
            });
        }
        else {
            return res.status(400).json({ message: "No valid recipient" });
        }
        console.log("Firebase notification sent:", response);
        await (0, notificationModel_1.logNotificationSend)(notificationId);
        await (0, notificationModel_1.updateNotification)(notificationId, { notification_send: true });
        return res.status(200).json({ message: "Notification sent" });
    }
    catch (error) {
        console.error("FCM Error:", error);
        return res
            .status(500)
            .json({ message: "Notification failed", error: error.message });
    }
};
exports.sendNotification = sendNotification;
async function getUserFcmToken(userId) {
    const [row] = await databaseConnection_1.db.query("SELECT token FROM user_fcm_tokens WHERE user_id = ?", [userId]);
    return row?.token || null;
}
