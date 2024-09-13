import { Request, Response } from "express";
import {
  getAllFaqCategories,
  createFaqCategory,
  getFaqCategoryById,
  updateFaqCategoryById,
  deleteFaqCategoryById,
} from "../../models/faqs/faqCategoryModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all FAQ categories
export const getFaqCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqCategories = await getAllFaqCategories();
    res
      .status(200)
      .json(createResponse(200, "FAQ Categories fetched successfully", faqCategories));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching FAQ categories", error));
  }
};

// Add a new FAQ category
export const addFaqCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, weightage } = req.body;
  try {
    await createFaqCategory(name, weightage);
    res.status(201).json(createResponse(201, "FAQ Category created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating FAQ category", error));
  }
};

// Get FAQ category by ID
export const getFaqCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const faqCategory = await getFaqCategoryById(parseInt(id));
    if (faqCategory.length === 0) {
      res.status(404).json(createResponse(404, "FAQ Category not found"));
    } else {
      res.status(200).json(createResponse(200, "FAQ Category fetched successfully", faqCategory));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching FAQ category", error));
  }
};

// Update FAQ category by ID
export const updateFaqCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, weightage } = req.body;
  try {
    await updateFaqCategoryById(parseInt(id), name, weightage);
    res.status(200).json(createResponse(200, "FAQ Category updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating FAQ category", error));
  }
};

// Delete FAQ category by ID
export const deleteFaqCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteFaqCategoryById(parseInt(id));
    res.status(200).json(createResponse(200, "FAQ Category deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting FAQ category", error));
  }
};
