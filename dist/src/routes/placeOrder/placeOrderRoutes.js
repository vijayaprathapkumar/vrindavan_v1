"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const placeOrderController_1 = require("../../controllers/placeOrder/placeOrderController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/:userId", authMiddleware_1.verifyDeviceToken, placeOrderController_1.fetchPlaceOrders);
router.get("/byId/:id", authMiddleware_1.verifyDeviceToken, placeOrderController_1.fetchPlaceOrderById);
router.post("/", authMiddleware_1.verifyDeviceToken, placeOrderController_1.addPlaceOrderController);
router.put("/:id", authMiddleware_1.verifyDeviceToken, placeOrderController_1.updatePlaceOrderController);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, placeOrderController_1.removePlaceOrder);
exports.default = router;
