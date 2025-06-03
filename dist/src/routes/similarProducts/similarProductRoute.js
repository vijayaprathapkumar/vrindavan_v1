"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const similarProductController_1 = require("../../controllers/similarProducts/similarProductController");
const router = (0, express_1.Router)();
router.get("/:foodId", authMiddleware_1.verifyDeviceToken, similarProductController_1.fetchSimilarProducts);
exports.default = router;
