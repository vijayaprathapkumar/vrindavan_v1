"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryBoyOrdersController_1 = require("../../controllers/orderAdmin/deliveryBoyOrdersController");
const router = (0, express_1.Router)();
router.get("/", deliveryBoyOrdersController_1.fetchDeliveryBoyOrders);
router.get("/summary", deliveryBoyOrdersController_1.fetchDeliveryBoyOrderSummary);
exports.default = router;
