"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const localityOrderController_1 = require("../../controllers/orderAdmin/localityOrderController");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, localityOrderController_1.getLocalityOrders);
router.get("/summary", authMiddleware_1.verifyDeviceToken, localityOrderController_1.getLocalityOrderSummary);
exports.default = router;
