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
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Define routes for FAQ categories
router.get("/", verifyDeviceToken, getFaqCategories);
router.post("/", verifyDeviceToken, addFaqCategory);
router.get("/:id", verifyDeviceToken, getFaqCategory);
router.put("/:id", updateFaqCategory, verifyDeviceToken);
router.delete("/:id", verifyDeviceToken, deleteFaqCategory);

export default router;
