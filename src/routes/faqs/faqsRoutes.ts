import express from "express";
import {
  getFaqs,
  addFaq,
  getFaq,
  updateFaq,
  deleteFaq,
} from "../../controllers/faqs/faqsControllers";
import {
  faqValidation,
  faqIdValidation,
  validate,
} from "../../validation/faqs/faqsValidation";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Define routes for FAQs
router.get("/", verifyDeviceToken, getFaqs);
router.post("/", verifyDeviceToken, addFaq);
router.get("/:id", verifyDeviceToken, getFaq);
router.put("/:id", verifyDeviceToken, validate, updateFaq);
router.delete("/:id", verifyDeviceToken, deleteFaq);

export default router;
