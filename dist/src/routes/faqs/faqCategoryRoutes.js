"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faqCategoriesController_1 = require("../../controllers/faqs/faqCategoriesController");
const faqCategoryValidation_1 = require("../../validation/faqs/faqCategoryValidation");
const router = express_1.default.Router();
// Define routes for FAQ categories
router.get("/", faqCategoriesController_1.getFaqCategories);
router.post("/", faqCategoryValidation_1.faqCategoryValidation, faqCategoryValidation_1.validate, faqCategoriesController_1.addFaqCategory);
router.get("/:id", faqCategoryValidation_1.faqCategoryIdValidation, faqCategoryValidation_1.validate, faqCategoriesController_1.getFaqCategory);
router.put("/:id", faqCategoryValidation_1.faqCategoryIdValidation, faqCategoryValidation_1.faqCategoryValidation, faqCategoryValidation_1.validate, faqCategoriesController_1.updateFaqCategory);
router.delete("/:id", faqCategoryValidation_1.faqCategoryIdValidation, faqCategoryValidation_1.validate, faqCategoriesController_1.deleteFaqCategory);
exports.default = router;
