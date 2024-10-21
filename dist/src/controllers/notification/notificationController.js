"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = exports.deleteNotification = exports.updateNotificationController = exports.fetchNotificationById = exports.addNotification = exports.fetchNotifications = void 0;
const notificationModel_1 = require("../../models/notification/notificationModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all notifications
const fetchNotifications = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm
        ? String(req.query.searchTerm)
        : undefined; // Extract searchTerm
    try {
        const { notifications, total } = await (0, notificationModel_1.getAllNotifications)(page, limit, searchTerm);
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
    const { notification_type, title, description, user_id, product_id, is_global, } = req.body;
    try {
        await (0, notificationModel_1.createNotification)({
            notification_type,
            title,
            description,
            user_id,
            product_id,
            is_global,
        });
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
    if (isNaN(notificationId)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid notification ID."));
    }
    try {
        const result = await (0, notificationModel_1.updateNotification)(notificationId, req.body);
        if (result.affectedRows > 0) {
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
        // Log the notification sending
        await (0, notificationModel_1.logNotificationSend)(notificationId);
        // Update notification status
        await (0, notificationModel_1.updateNotification)(notificationId, { notification_send: true });
        return res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Notification sent successfully."));
    }
    catch (error) {
        console.error("Error sending notification:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error sending notification.", error.message));
    }
};
exports.sendNotification = sendNotification;
