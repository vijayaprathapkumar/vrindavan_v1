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
export const getFaqCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  let {
    page = 1,
    limit = 10,
    searchTerm = "",
    sortField = "",
    sortOrder = "",
  } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (isNaN(page) || page <= 0) {
    page = 1;
  }
  if (isNaN(limit) || limit <= 0) {
    limit = 10;
  }

  try {
    const { faqCategories, total } = await getAllFaqCategories(
      page,
      limit,
      searchTerm as string,
      sortField as string,
      sortOrder as string
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      statusCode: 200,
      message: "FAQ Categories fetched successfully",
      data: {
        faqCategories,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error fetching FAQ categories",
      error,
    });
  }
};

// Add a new FAQ category
export const addFaqCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, weightage } = req.body;
  try {
    await createFaqCategory(name, weightage);
    res
      .status(201)
      .json(createResponse(201, "FAQ Category created successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error creating FAQ category", error));
  }
};

// Get FAQ category by ID
export const getFaqCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json(createResponse(400, "Invalid FAQ category ID"));
      return;
    }

    const category = await getFaqCategoryById(id);

    if (!category) {
      res.status(404).json(createResponse(404, "FAQ category not found"));
    } else {
      res
        .status(200)
        .json(
          createResponse(200, "FAQ category fetched successfully", category)
        );
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching FAQ category", error));
  }
};

// Update FAQ category by ID
export const updateFaqCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, weightage } = req.body;
  try {
    await updateFaqCategoryById(parseInt(id), name, weightage);
    res
      .status(200)
      .json(createResponse(200, "FAQ Category updated successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error updating FAQ category", error));
  }
};

// Delete FAQ category by ID
export const deleteFaqCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteFaqCategoryById(parseInt(id));
    res
      .status(200)
      .json(createResponse(200, "FAQ Category deleted successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error deleting FAQ category", error));
  }
};
