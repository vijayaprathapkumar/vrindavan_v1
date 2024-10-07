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
router.post(
  "/",
  faqCategoryValidation,
  verifyDeviceToken,
  validate,
  addFaqCategory
);
router.get(
  "/:id",
  faqCategoryIdValidation,
  verifyDeviceToken,
  validate,
  getFaqCategory
);
router.put(
  "/:id",
  faqCategoryIdValidation,
  faqCategoryValidation,
  validate,
  updateFaqCategory,
  verifyDeviceToken
);
router.delete(
  "/:id",
  verifyDeviceToken,
  faqCategoryIdValidation,
  validate,
  deleteFaqCategory
);

export default router;
