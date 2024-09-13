import express from "express";
import {
  getFaqCategories,
  addFaqCategory,
  getFaqCategory,
  updateFaqCategory,
  deleteFaqCategory,
} from "../../controllers/faqs/faqCategoriesController";
import {
  faqCategoryValidation,
  faqCategoryIdValidation,
  validate,
} from "../../validation/faqs/faqCategoryValidation";

const router = express.Router();

// Define routes for FAQ categories
router.get("/", getFaqCategories);
router.post("/", faqCategoryValidation, validate, addFaqCategory);
router.get("/:id", faqCategoryIdValidation, validate, getFaqCategory);
router.put(
  "/:id",
  faqCategoryIdValidation,
  faqCategoryValidation,
  validate,
  updateFaqCategory
);
router.delete("/:id", faqCategoryIdValidation, validate, deleteFaqCategory);

export default router;
