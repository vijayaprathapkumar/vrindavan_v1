"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faqsControllers_1 = require("../../controllers/faqs/faqsControllers");
const faqsValidation_1 = require("../../validation/faqs/faqsValidation");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = express_1.default.Router();
// Define routes for FAQs
router.get("/", authMiddleware_1.verifyDeviceToken, faqsControllers_1.getFaqs);
router.post("/", authMiddleware_1.verifyDeviceToken, faqsControllers_1.addFaq);
router.get("/:id", authMiddleware_1.verifyDeviceToken, faqsControllers_1.getFaq);
router.put("/:id", authMiddleware_1.verifyDeviceToken, faqsValidation_1.validate, faqsControllers_1.updateFaq);
router.delete("/:id", authMiddleware_1.verifyDeviceToken, faqsControllers_1.deleteFaq);
exports.default = router;
