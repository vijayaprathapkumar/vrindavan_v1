"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commissionPayoutController_1 = require("../../controllers/deliveryBoy/commissionPayoutController");
const router = express_1.default.Router();
router.get("/", commissionPayoutController_1.getCommissionPayouts);
exports.default = router;
