import { Request, Response } from "express";
import {
  getAllSubCategoriesWithCategory,
  getSubcategoriesCount,
  createSubCategory,
  getSubCategoryById,
  updateSubCategoryById,
  deleteSubCategoryById,
} from "../../models/inventory/subcategoryModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all subcategories with pagination, search, and categoryId filter
export const getSubcategories = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = (req.query.searchTerm as string) || "";
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : null;
  const offset = (page - 1) * limit;

  try {
    const totalCount = await getSubcategoriesCount(searchTerm, categoryId);
    const subcategories = await getAllSubCategoriesWithCategory(limit, offset, searchTerm, categoryId);
    const totalPages = Math.ceil(totalCount / limit);

    const subcategoriesWithMedia = subcategories.map(subcategory => {
      const subcategoryResponse = {
        id: subcategory.id,
        category_id: subcategory.category_id,
        subcategory_name: subcategory.name,
        description: subcategory.description,
        weightage: subcategory.weightage,
        subcategory_created_at: subcategory.created_at,
        media: [],
      };

      if (subcategory.media_id) {
        subcategoryResponse.media.push({
          media_id: subcategory.media_id,
          file_name: subcategory.file_name,
          mime_type: subcategory.mime_type,
          disk: subcategory.disk,
          conversions_disk: subcategory.conversions_disk,
          size: subcategory.size,
          manipulations: subcategory.manipulations,
          custom_properties: subcategory.custom_properties,
          generated_conversions: subcategory.generated_conversions,
          responsive_images: subcategory.responsive_images,
          order_column: subcategory.order_column,
          created_at: subcategory.media_created_at,
          updated_at: subcategory.media_updated_at,
          original_url: subcategory.original_url,
        });
      }

      return subcategoryResponse;
    });

    res.status(200).json({
      statusCode: 200,
      message: "Subcategories fetched successfully",
      data: {
        subcategories: subcategoriesWithMedia,
        totalCount,
        currentPage: page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching subcategories", error.message));
  }
};


// Add a new subcategory (POST)
export const addSubcategory = async (req: Request, res: Response): Promise<void> => {
  const { category_id, name, description, weightage, active } = req.body;
  try {
    await createSubCategory(category_id, name, description, weightage, active);
    res.status(201).json({
      statusCode: 201,
      message: "Subcategory created successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating subcategory", error.message));
  }
};

// Get subcategory by ID (GET)
export const getSubcategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const rows = await getSubCategoryById(parseInt(id));

    if (rows.length === 0) {
      throw new Error("Subcategory not found");
    }

    const subcategory = {
      subcategory_id: rows[0].id,
      subcategory_name: rows[0].name,
      description: rows[0].description,
      weightage: rows[0].weightage,
      subcategory_created_at: rows[0].created_at,
      media: rows.map(row => ({
        media_id: row.media_id,
        file_name: row.file_name,
        mime_type: row.mime_type,
        disk: row.disk,
        conversions_disk: row.conversions_disk,
        size: row.size,
        manipulations: row.manipulations,
        custom_properties: row.custom_properties,
        generated_conversions: row.generated_conversions,
        responsive_images: row.responsive_images,
        order_column: row.order_column,
        created_at: row.media_created_at,
        updated_at: row.media_updated_at,
        original_url: row.original_url,
      })).filter(mediaItem => mediaItem.media_id !== null),
    };

    res.status(200).json({
      statusCode: 200,
      message: "Subcategory fetched successfully",
      data: {
        subcategory: subcategory,
      },
    });
  } catch (error) {
    const statusCode = error.message === "Subcategory not found" ? 404 : 500;
    res.status(statusCode).json(createResponse(statusCode, error.message));
  }
};

// Update subcategory by ID (PUT)
export const updateSubcategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { category_id, name, description, weightage, active } = req.body;

  try {
    await updateSubCategoryById(parseInt(id), category_id, name, description, weightage, active);
    res.status(200).json({
      statusCode: 200,
      message: "Subcategory updated successfully",
      data: {
        updateSubcategory_id: parseInt(id),
      },
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating subcategory", error.message));
  }
};

// Delete subcategory by ID (DELETE)
export const deleteSubcategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteSubCategoryById(parseInt(id));
    res.status(200).json({
      statusCode: 200,
      message: "Subcategory deleted successfully",
      data: {
        deleted_subcategory_id: parseInt(id),
      },
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting subcategory", error.message));
  }
};
