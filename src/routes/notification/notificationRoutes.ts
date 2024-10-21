import express from "express";
import {
  fetchNotifications,
  addNotification,
  fetchNotificationById,
  updateNotificationController,
  deleteNotification,
  sendNotification,
} from "../../controllers/notification/notificationController";

const router = express.Router();

router.get("/", fetchNotifications);

router.post("/", addNotification);

router.get("/:id", fetchNotificationById);

router.put("/:id", updateNotificationController);

router.delete("/:id", deleteNotification);

router.post("/:id/send", sendNotification);

export default router;
