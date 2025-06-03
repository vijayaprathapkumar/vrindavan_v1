"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../../controllers/notification/notificationController");
const router = express_1.default.Router();
router.get("/", notificationController_1.fetchNotifications);
router.post("/", notificationController_1.addNotification);
router.get("/:id", notificationController_1.fetchNotificationById);
router.put("/:id", notificationController_1.updateNotificationController);
router.delete("/:id", notificationController_1.deleteNotification);
router.post("/send/:id", notificationController_1.sendNotification);
exports.default = router;
