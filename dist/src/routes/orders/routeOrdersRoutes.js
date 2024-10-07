"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeOrdersController_1 = require("../../controllers/orders/routeOrdersController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.verifyDeviceToken, routeOrdersController_1.getRouteOrders);
exports.default = router;
