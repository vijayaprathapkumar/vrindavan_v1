"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ordersController_1 = require("../../controllers/orders-v1/ordersController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/:userId", authMiddleware_1.verifyDeviceToken, ordersController_1.fetchOrders);
router.get("/by/:id", authMiddleware_1.verifyDeviceToken, ordersController_1.fetchOrderById);
router.put("/:id", authMiddleware_1.verifyDeviceToken, ordersController_1.updateOrderController);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, ordersController_1.removeOrder);
exports.default = router;
