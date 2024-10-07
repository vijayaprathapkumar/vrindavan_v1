"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dealOfTheDayController_1 = require("../../controllers/dealOfTheDay/dealOfTheDayController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.verifyDeviceToken, dealOfTheDayController_1.fetchDeals);
router.post("/", authMiddleware_1.verifyDeviceToken, dealOfTheDayController_1.addDeal);
router.get("/:id", authMiddleware_1.verifyDeviceToken, dealOfTheDayController_1.fetchDealById);
router.put("/:id", authMiddleware_1.verifyDeviceToken, dealOfTheDayController_1.updateDealById);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, dealOfTheDayController_1.removeDeal);
exports.default = router;
