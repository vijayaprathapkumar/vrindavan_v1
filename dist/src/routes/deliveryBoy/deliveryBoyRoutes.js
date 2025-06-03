"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const deliveryBoyController_1 = require("../../controllers/deliveryBoy/deliveryBoyController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Define routes for delivery boys
router.get("/", authMiddleware_1.verifyDeviceToken, deliveryBoyController_1.getDeliveryBoysWithLocalities);
router.post("/", authMiddleware_1.verifyDeviceToken, deliveryBoyController_1.addDeliveryBoy);
router.get("/:id", authMiddleware_1.verifyDeviceToken, deliveryBoyController_1.getDeliveryBoy);
router.put("/:id", authMiddleware_1.verifyDeviceToken, deliveryBoyController_1.updateDeliveryBoy);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, deliveryBoyController_1.deleteDeliveryBoy);
router.delete("/localities/:id", authMiddleware_1.verifyDeviceToken, deliveryBoyController_1.deleteLocalitiesForDeliveryBoy);
exports.default = router;
