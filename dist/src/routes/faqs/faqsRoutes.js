"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faqsControllers_1 = require("../../controllers/faqs/faqsControllers");
const faqsValidation_1 = require("../../validation/faqs/faqsValidation");
const router = express_1.default.Router();
// Define routes for FAQs
router.get("/", faqsControllers_1.getFaqs);
router.post("/", faqsValidation_1.faqValidation, faqsValidation_1.validate, faqsControllers_1.addFaq);
router.get("/:id", faqsValidation_1.faqIdValidation, faqsValidation_1.validate, faqsControllers_1.getFaq);
router.put("/:id", faqsValidation_1.faqIdValidation, faqsValidation_1.faqValidation, faqsValidation_1.validate, faqsControllers_1.updateFaq);
router.delete("/:id", faqsValidation_1.faqIdValidation, faqsValidation_1.validate, faqsControllers_1.deleteFaq);
exports.default = router;
