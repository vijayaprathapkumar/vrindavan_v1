"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const routeOrderController_1 = require("../../controllers/orderAdmin/routeOrderController");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, routeOrderController_1.getFoodOrders);
router.get("/summary", authMiddleware_1.verifyDeviceToken, routeOrderController_1.getFoodOrderSummaryController);
exports.default = router;
