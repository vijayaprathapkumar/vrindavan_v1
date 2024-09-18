import { Request, Response } from "express";
import {
  getAllSubCategoriesWithCategory,
  createSubCategory,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById
} from "../../models/inventory/subcategoryModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all subcategories with category relationship
export const getSubCategoriesWithCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const subCategories = await getAllSubCategoriesWithCategory();
    res.status(200).json(createResponse(200, "Subcategories with categories fetched successfully", subCategories));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching subcategories with categories", error));
  }
};

// Add a new subcategory
export const addSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { category_id, name, description, weightage, active } = req.body;
  try {
    const result = await createSubCategory(category_id, name, description, weightage, active);
    res.status(201).json(createResponse(201, "Subcategory created successfully", { insertId: result.insertId }));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating subcategory", error));
  }
};

// Get subcategory by ID
export const getSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const subCategory = await getSubCategoryById(parseInt(id));
    if (subCategory.length === 0) {
      res.status(404).json(createResponse(404, "Subcategory not found"));
    } else {
      res.status(200).json(createResponse(200, "Subcategory fetched successfully", subCategory[0]));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching subcategory", error));
  }
};

// Update subcategory by ID
export const updateSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { category_id, name, description, weightage, active } = req.body;
  try {
    await updateSubCategoryById(parseInt(id), category_id, name, description, weightage, active);
    res.status(200).json(createResponse(200, "Subcategory updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating subcategory", error));
  }
};

// Delete subcategory by ID
export const deleteSubCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteSubCategoryById(parseInt(id));
    res.status(200).json(createResponse(200, "Subcategory deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting subcategory", error));
  }
};
