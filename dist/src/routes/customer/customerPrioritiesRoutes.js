"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerPrioritiesController_1 = require("../../controllers/customer/customerPrioritiesController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.verifyDeviceToken, customerPrioritiesController_1.updateCustomerPriority);
exports.default = router;
