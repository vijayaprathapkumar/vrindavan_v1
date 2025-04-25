import { Request, Response } from "express";
import {
  createFeaturedCategory,
  getFeaturedCategories,
} from "../../models/featureProduct/featureProductModel";
import { createResponse } from "../../utils/responseHandler";

export const fetchFeaturedCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;
  const searchTerm = req.query.searchTerm as string;

  try {
    const featuredCategories = await getFeaturedCategories(
      limit,
      offset,
      searchTerm
    );

    return res.status(200).json(
      createResponse(200, "Featured categories fetched successfully.", {
        featuredCategories: featuredCategories.data,
        currentPage: page,
        limit,
        totalPages: Math.ceil(featuredCategories.totalItems / limit),
        totalItems: featuredCategories.totalItems,
      })
    );
  } catch (error) {
    console.error("Error fetching featured categories:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch featured categories."));
  }
};

export const addFeaturedCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { category_id, sub_category_id, status, category_type } = req.body;

  if (!category_id || typeof status === "undefined") {
    return res
      .status(400)
      .json(
        createResponse(
          400,
          "Missing required fields: category_id and status are mandatory."
        )
      );
  }

  try {
    const newCategory = await createFeaturedCategory({
      category_id,
      sub_category_id,
      status,
      category_type,
    });

    return res
      .status(201)
      .json(
        createResponse(
          201,
          "Featured category added successfully.",
          newCategory
        )
      );
  } catch (error) {
    console.error("Error adding featured category:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to add featured category."));
  }
};
