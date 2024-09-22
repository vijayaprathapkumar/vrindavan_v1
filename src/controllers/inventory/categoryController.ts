import { Request, Response } from "express";
import {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from "../../models/inventory/categoryModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all categories
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await getAllCategories();
    res
      .status(200)
      .json(createResponse(200, "Categories fetched successfully", categories));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching categories", error));
  }
};

// Add a new category (POST)
export const addCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description, weightage, image } = req.body;
  try {
    // Pass image only if it's provided
    await createCategory(name, description, weightage, image);
    res.status(201).json(createResponse(201, "Category created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating category", error));
  }
};

// Get category by ID
export const getCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const category = await getCategoryById(parseInt(id));
    if (category.length === 0) {
      res.status(404).json(createResponse(404, "Category not found"));
    } else {
      res
        .status(200)
        .json(createResponse(200, "Category fetched successfully", category));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching category", error));
  }
};

// Update category by ID (PUT)
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, description, weightage, image } = req.body;

  try {
    // Pass image only if it's provided
    await updateCategoryById(parseInt(id), name, description, weightage, image);
    res.status(200).json(createResponse(200, "Category updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating category", error));
  }
};

// Delete category by ID
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteCategoryById(parseInt(id));
    res.status(200).json(createResponse(200, "Category deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting category", error));
  }
};
