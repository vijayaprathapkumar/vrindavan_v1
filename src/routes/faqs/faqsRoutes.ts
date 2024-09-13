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
  validate
} from "../../validation/faqs/faqsValidation";

const router = express.Router();

// Define routes for FAQs
router.get("/", getFaqs);
router.post("/", faqValidation, validate, addFaq);
router.get("/:id", faqIdValidation, validate, getFaq);
router.put("/:id", faqIdValidation, faqValidation, validate, updateFaq);
router.delete("/:id", faqIdValidation, validate, deleteFaq);

export default router;
