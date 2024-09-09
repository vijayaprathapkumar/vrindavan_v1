import { Request, Response } from "express";
import {
  getAllSubcategories,
  createSubcategory,
  getSubcategoryById as fetchSubcategoryById, // Renaming to avoid conflict
  updateSubcategoryById,
  deleteSubcategoryById
} from "../../models/inventoryModels/subcategoryModel";
import { createResponse } from "../../utils/responseHandler";

export const getSubcategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subcategories = await getAllSubcategories();
    res
      .status(200)
      .json(
        createResponse(200, "Subcategories fetched successfully", subcategories)
      );
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching subcategories", error));
  }
};

export const addSubcategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, categoryID, description, weightage, image } = req.body;
  try {
    await createSubcategory(name, categoryID, description, weightage, image);
    res
      .status(201)
      .json(createResponse(201, "Subcategory created successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error creating subcategory", error));
  }
};

export const getSubcategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const subcategory = await fetchSubcategoryById(parseInt(id)); // Using renamed import
    if (subcategory.length === 0) {
      res.status(404).json(createResponse(404, "Subcategory not found"));
    } else {
      res
        .status(200)
        .json(
          createResponse(200, "Subcategory fetched successfully", subcategory[0])
        );
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching subcategory", error));
  }
};

export const updateSubcategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, categoryID, description, weightage, image } = req.body;
  try {
    const result = await updateSubcategoryById(parseInt(id), name, categoryID, description, weightage, image);
    if (result.affectedRows === 0) {
      res.status(404).json(createResponse(404, "Subcategory not found"));
    } else {
      res
        .status(200)
        .json(createResponse(200, "Subcategory updated successfully"));
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error updating subcategory", error));
  }
};

export const deleteSubcategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await deleteSubcategoryById(parseInt(id));
    if (result.affectedRows === 0) {
      res.status(404).json(createResponse(404, "Subcategory not found"));
    } else {
      res
        .status(200)
        .json(createResponse(200, "Subcategory deleted successfully"));
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error deleting subcategory", error));
  }
};
