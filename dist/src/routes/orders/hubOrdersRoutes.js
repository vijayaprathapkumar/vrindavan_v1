"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hubOrdersController_1 = require("../../controllers/orders/hubOrdersController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.verifyDeviceToken, hubOrdersController_1.getHubOrders);
exports.default = router;
