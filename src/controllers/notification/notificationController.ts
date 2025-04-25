import { Request, Response } from "express";
import {
  getAllNotifications,
  createNotification,
  getNotificationById,
  updateNotification,
  deleteNotificationById,
  logNotificationSend,
} from "../../models/notification/notificationModel";
import { createResponse } from "../../utils/responseHandler";
import {
  insertMediaRecord,
  updateMediaRecord,
} from "../imageUpload/imageUploadController";

// Fetch all notifications
export const fetchNotifications = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
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
    const { notifications, total } = await getAllNotifications(
      page,
      limit,
      searchTerm,
      sortField,
      sortOrder
    );

    const totalPages = Math.ceil(total / limit);
    return res.status(200).json(
      createResponse(200, "Notifications fetched successfully.", {
        notifications,
        totalCount: total,
        totalPages,
        currentPage: page,
        limit,
      })
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "Error fetching notifications.", error.message)
      );
  }
};

// Create a new notification
export const addNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    notification_type,
    title,
    description,
    user_id,
    product_id,
    is_global,
    media,
  } = req.body;

  try {
    const notificationId = await createNotification({
      notification_type,
      title,
      description,
      user_id,
      product_id,
      is_global,
    });

    if (media) {
      const { model_type, file_name, mime_type, size } = media;
      await insertMediaRecord(
        model_type,
        notificationId,
        file_name,
        mime_type,
        size
      );
    }
    return res
      .status(201)
      .json(createResponse(201, "Notification created successfully."));
  } catch (error) {
    console.error("Error creating notification:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error creating notification.", error.message));
  }
};

// Get a notification by ID
export const fetchNotificationById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const notificationId = Number(req.params.id);

  if (isNaN(notificationId)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid notification ID."));
  }

  try {
    const notification = await getNotificationById(notificationId);

    if (!notification) {
      return res
        .status(404)
        .json(createResponse(404, "Notification not found."));
    }

    const responseNotification = { notification: [notification] };
    return res
      .status(200)
      .json(
        createResponse(
          200,
          "Notification fetched successfully.",
          responseNotification
        )
      );
  } catch (error) {
    console.error("Error fetching notification:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching notification.", error.message));
  }
};

// Update a notification by ID
export const updateNotificationController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const notificationId = Number(req.params.id);
  const { media } = req.body;

  if (isNaN(notificationId)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid notification ID."));
  }

  try {
    const result = await updateNotification(notificationId, req.body);

    if (result.affectedRows > 0) {
      if (media && media.media_id) {
        const { media_id, file_name, mime_type, size } = media;
        await updateMediaRecord(media_id, file_name, mime_type, size);
      }
      return res
        .status(200)
        .json(createResponse(200, "Notification updated successfully."));
    } else {
      return res
        .status(404)
        .json(createResponse(404, "Notification not found."));
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error updating notification.", error.message));
  }
};

// Delete a notification by ID
export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const notificationId = Number(req.params.id);

  if (isNaN(notificationId)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid notification ID."));
  }

  try {
    const result = await deleteNotificationById(notificationId);

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json(createResponse(200, "Notification deleted successfully."));
    } else {
      return res
        .status(404)
        .json(createResponse(404, "Notification not found."));
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error deleting notification.", error.message));
  }
};

// Send notification and log it
export const sendNotification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const notificationId = Number(req.params.id);

  if (isNaN(notificationId)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid notification ID."));
  }

  try {
    const notification = await getNotificationById(notificationId);

    if (!notification) {
      return res
        .status(404)
        .json(createResponse(404, "Notification not found."));
    }

    // Log the notification sending
    await logNotificationSend(notificationId);

    // Update notification status
    await updateNotification(notificationId, { notification_send: true });

    return res
      .status(200)
      .json(createResponse(200, "Notification sent successfully."));
  } catch (error) {
    console.error("Error sending notification:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error sending notification.", error.message));
  }
};
