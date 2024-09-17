"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hubOrdersController_1 = require("../../controllers/orders/hubOrdersController");
const router = (0, express_1.Router)();
router.get('/', hubOrdersController_1.getHubOrders);
exports.default = router;
