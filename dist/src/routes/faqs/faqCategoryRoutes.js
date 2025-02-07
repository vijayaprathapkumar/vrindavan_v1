"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faqCategoriesController_1 = require("../../controllers/faqs/faqCategoriesController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Define routes for FAQ categories
router.get("/", authMiddleware_1.verifyDeviceToken, faqCategoriesController_1.getFaqCategories);
router.post("/", authMiddleware_1.verifyDeviceToken, faqCategoriesController_1.addFaqCategory);
router.get("/:id", authMiddleware_1.verifyDeviceToken, faqCategoriesController_1.getFaqCategory);
router.put("/:id", faqCategoriesController_1.updateFaqCategory, authMiddleware_1.verifyDeviceToken);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, faqCategoriesController_1.deleteFaqCategory);
exports.default = router;
