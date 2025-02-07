"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const deliveryAddressesController_1 = require("../../controllers/customer/deliveryAddressesController");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, deliveryAddressesController_1.getDeliveryAddresses);
router.put("/:id", authMiddleware_1.verifyDeviceToken, deliveryAddressesController_1.updateDeliveryAddress);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, deliveryAddressesController_1.deleteDeliveryAddress);
exports.default = router;
