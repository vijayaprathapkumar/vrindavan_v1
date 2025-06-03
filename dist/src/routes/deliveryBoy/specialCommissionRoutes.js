"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const specialCommissionController_1 = require("../../controllers/deliveryBoy/specialCommissionController");
const router = express_1.default.Router();
// Define routes for special commissions
router.post("/", authMiddleware_1.verifyDeviceToken, specialCommissionController_1.addSpecialCommissionController);
router.get("/", authMiddleware_1.verifyDeviceToken, specialCommissionController_1.getDetailedSpecialCommissions);
router.put("/:id", authMiddleware_1.verifyDeviceToken, specialCommissionController_1.updateSpecialCommissionController);
router.get("/:id", authMiddleware_1.verifyDeviceToken, specialCommissionController_1.getDetailedSpecialCommission);
exports.default = router;
