"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const stockCountController_1 = require("../../controllers/inventory/stockCountController");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, stockCountController_1.getStockSummary);
exports.default = router;
