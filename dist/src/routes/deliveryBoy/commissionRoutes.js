"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commissionController_1 = require("../../controllers/deliveryBoy/commissionController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, commissionController_1.getDetailedCommissions);
router.put("/:commissionId", authMiddleware_1.verifyDeviceToken, commissionController_1.updateCommissionController);
router.get("/:id", authMiddleware_1.verifyDeviceToken, commissionController_1.getDetailedCommission);
exports.default = router;
