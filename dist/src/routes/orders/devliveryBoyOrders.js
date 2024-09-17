"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryBoyOrdersController_1 = require("../../controllers/orders/deliveryBoyOrdersController");
const router = (0, express_1.Router)();
router.get('/', deliveryBoyOrdersController_1.getDeliveryBoyOrders);
exports.default = router;
