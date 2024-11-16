import { Request, Response } from "express";
import {
  getAllCategories,
  getCategoriesCount,
  createCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
} from "../../models/inventory/categoryModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all categories with pagination and search
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = (req.query.searchTerm as string) || "";
  const offset = (page - 1) * limit;

  try {
    const totalCount = await getCategoriesCount(searchTerm);
    const categories = await getAllCategories(limit, offset, searchTerm);
    const totalPages = Math.ceil(totalCount / limit);

    const categoriesWithMedia = categories.map(category => {
      console.log('category',category);
      
      const categoryResponse = {
            category_id: category.category_id,
            category_name: category.category_name,
            description: category.description,
            weightage: category.weightage,
            created_at: category.created_at,
            updated_at:category.updated_at,
        media: [] 
      };

      if (category.media_id) {
        categoryResponse.media.push({
          media_id: category.media_id,
          file_name: category.file_name,
          mime_type: category.mime_type,
          disk: category.disk,
          conversions_disk: category.conversions_disk,
          size: category.size,
          manipulations: category.manipulations,
          custom_properties: category.custom_properties,
          generated_conversions: category.generated_conversions,
          responsive_images: category.responsive_images,
          order_column: category.order_column,
          created_at: category.media_created_at,
          updated_at: category.media_updated_at,
          original_url: category.original_url,
        });
      }

      return categoryResponse;
    });

    res.status(200).json({
      statusCode: 200,
      message: "Categories fetched successfully",
      data: {
        categories: categoriesWithMedia,
        totalCount,
        currentPage: page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching categories", error.message));
  }
};


// Add a new category (POST)
export const addCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, description, weightage, image } = req.body;
  try {
    await createCategory(name, description, weightage, image);
    res.status(201).json({
      statusCode: 201,
      message: "Category created successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating category", error.message));
  }
};


// Get category by ID (GET)
export const getCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const rows = await getCategoryById(parseInt(id));

    if (rows.length === 0) {
      throw new Error("Category not found");
    }

    const category = {
      category_id: rows[0].category_id,
      category_name: rows[0].category_name,
      description: rows[0].description,
      weightage: rows[0].weightage,
      category_created_at: rows[0].category_created_at,
      media: rows
        .map((row) => ({
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
        }))
        .filter((mediaItem) => mediaItem.media_id !== null),
    };

    res.status(200).json({
      statusCode: 200,
      message: "Category fetched successfully",
      data: {
        category: [category], 
      },
    });
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 500;
    res.status(statusCode).json(createResponse(statusCode, error.message));
  }
};


// Update category by ID (PUT)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, weightage, image } = req.body;

  try {
    await updateCategoryById(parseInt(id), name, description, weightage, image);
    res.status(200).json({
      statusCode: 200,
      message: "Category updated successfully",
      data: {
        updateCategory_id: parseInt(id)
      },
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating category", error.message));
  }
};

// Delete category by ID (DELETE)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteCategoryById(parseInt(id));
    res.status(200).json({
      statusCode: 200,
      message: "Category deleted successfully",
      data: {
        deleted_category_id: parseInt(id),
      },
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting category", error.message));
  }
};
