"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryBoyOrdersController_1 = require("../../controllers/orders/deliveryBoyOrdersController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.verifyDeviceToken, deliveryBoyOrdersController_1.getDeliveryBoyOrders);
exports.default = router;
