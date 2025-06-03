"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderStatusController_1 = require("../../controllers/orderStatus/orderStatusController");
const router = express_1.default.Router();
router.get("/", orderStatusController_1.checkOrderStatus);
exports.default = router;
