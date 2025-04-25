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
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const searchTerm = (req.query.searchTerm as string) || "";
    const faqCategoryId = req.query.faqCategoryId
      ? req.query.faqCategoryId === "All"
        ? undefined
        : parseInt(req.query.faqCategoryId as string)
      : undefined;
    const sortField = String(req.query.sortField || "");
    const sortOrder = String(req.query.sortOrder || "");
    if (faqCategoryId !== undefined && isNaN(faqCategoryId)) {
      res.status(400).json({
        status: 400,
        message: "Invalid faqCategoryId",
      });
      return;
    }

    const { faqs, total } = await getAllFaqs(
      page,
      limit,
      searchTerm,
      faqCategoryId,
      sortField,
      sortOrder
    );

    res.status(200).json({
      status: 200,
      message: "FAQs fetched successfully",
      data: {
        faqs,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
      },
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Error fetching FAQs", error });
    return;
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
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json(createResponse(400, "Invalid FAQ ID"));
      return;
    }
    const faq = await getFaqById(id);
    if (!faq) {
      res.status(404).json(createResponse(404, "FAQ not found"));
    } else {
      res
        .status(200)
        .json(createResponse(200, "FAQ fetched successfully", faq));
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
    await updateFaqById(
      parseInt(id),
      question,
      answer,
      faqCategoryId,
      weightage
    );
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
