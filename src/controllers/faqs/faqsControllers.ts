import { Request, Response } from "express";
import {
  getAllFaqs,
  createFaq,
  getFaqById,
  updateFaqById,
  deleteFaqById,
} from "../../models/faqs/faqsModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all FAQs
export const getFaqs = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqs = await getAllFaqs();
    res
      .status(200)
      .json(createResponse(200, "FAQs fetched successfully", faqs));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching FAQs", error));
  }
};

// Add a new FAQ
export const addFaq = async (req: Request, res: Response): Promise<void> => {
  const { question, answer, faqCategoryId, weightage } = req.body;
  try {
    await createFaq(question, answer, faqCategoryId, weightage);
    res.status(201).json(createResponse(201, "FAQ created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating FAQ", error));
  }
};

// Get FAQ by ID
export const getFaq = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const faq = await getFaqById(parseInt(id));
    if (faq.length === 0) {
      res.status(404).json(createResponse(404, "FAQ not found"));
    } else {
      res.status(200).json(createResponse(200, "FAQ fetched successfully", faq));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching FAQ", error));
  }
};

// Update FAQ by ID
export const updateFaq = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { question, answer, faqCategoryId, weightage } = req.body;
  try {
    await updateFaqById(parseInt(id), question, answer, faqCategoryId, weightage);
    res.status(200).json(createResponse(200, "FAQ updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating FAQ", error));
  }
};

// Delete FAQ by ID
export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteFaqById(parseInt(id));
    res.status(200).json(createResponse(200, "FAQ deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting FAQ", error));
  }
};
