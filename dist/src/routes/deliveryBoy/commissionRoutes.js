"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commissionController_1 = require("../../controllers/deliveryBoy/commissionController");
const commissionValidation_1 = require("../../validation/deliveryBoy/commissionValidation");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Define routes for commissions
router.get("/", authMiddleware_1.verifyDeviceToken, commissionController_1.getDetailedCommissions);
router.get("/:id", commissionValidation_1.commissionIdValidation, authMiddleware_1.verifyDeviceToken, commissionValidation_1.validate, commissionController_1.getDetailedCommission);
exports.default = router;
