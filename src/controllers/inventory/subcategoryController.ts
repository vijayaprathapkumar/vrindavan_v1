import { Request, Response } from "express";
import {
  getAllSubCategoriesWithCategory,
  createSubCategory,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById,
} from "../../models/inventory/subcategoryModel";
import { createResponse } from "../../utils/responseHandler";
import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

// Fetch all subcategories with category relationship
export const getSubCategoriesWithCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10; 
    const page = parseInt(req.query.page as string) || 1; 
    const searchTerm = (req.query.searchTerm as string) || "";

    const offset = (page - 1) * limit;

    const [totalCountRows] = await db
      .promise()
      .query<RowDataPacket[]>(
        "SELECT COUNT(*) as total FROM sub_categories WHERE name LIKE ?",
        [`%${searchTerm}%`]
      );
    const totalCount = totalCountRows[0]?.total || 0;

    const subCategories = await getAllSubCategoriesWithCategory(
      limit,
      offset,
      searchTerm
    );

    const response = {
      data: subCategories,
      totalCount,
      limit,
      page,
      totalPages: Math.ceil(totalCount / limit),
    };

    res
      .status(200)
      .json(
        createResponse(
          200,
          "Subcategories with categories fetched successfully",
          response
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Error fetching subcategories with categories",
          error
        )
      );
  }
};

// Add a new subcategory
export const addSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category_id, name, description, weightage, active } = req.body;
  try {
    const result = await createSubCategory(
      category_id,
      name,
      description,
      weightage,
      active
    );
    res
      .status(201)
      .json(
        createResponse(201, "Subcategory created successfully", {
          insertId: result.insertId,
        })
      );
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error creating subcategory", error));
  }
};

// Get subcategory by ID
export const getSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params; 
  try {
    const subCategory = await getSubCategoryById(parseInt(id)); 
    if (subCategory.length === 0) {
      res.status(404).json(createResponse(404, "Subcategory not found")); 
    } else {
      res
        .status(200)
        .json(
          createResponse(
            200,
            "Subcategory fetched successfully",
            [subCategory[0]] 
          )
        );
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching subcategory", error)); 
  }
};

// Update subcategory by ID
export const updateSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { category_id, name, description, weightage, active } = req.body;
  try {
    await updateSubCategoryById(
      parseInt(id),
      category_id,
      name,
      description,
      weightage,
      active
    );
    res
      .status(200)
      .json(createResponse(200, "Subcategory updated successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error updating subcategory", error));
  }
};

// Delete subcategory by ID
export const deleteSubCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteSubCategoryById(parseInt(id));
    res
      .status(200)
      .json(createResponse(200, "Subcategory deleted successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error deleting subcategory", error));
  }
};
