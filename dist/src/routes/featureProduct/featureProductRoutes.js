"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const featureProductController_1 = require("../../controllers/featureProduct/featureProductController");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.verifyDeviceToken, featureProductController_1.fetchFeaturedCategories);
exports.default = router;
