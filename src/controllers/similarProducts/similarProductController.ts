import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  getSimilarProductsWithCount,
  getSubcategoryId,
} from "../../models/similarProducts/similarProductModel";

export const fetchSimilarProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const foodId = parseInt(req.params.foodId);
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;

  if (isNaN(foodId) || foodId <= 0) {
    return res.status(400).json(createResponse(400, "Invalid food ID."));
  }

  try {
    const subcategoryId = await getSubcategoryId(foodId);
    if (!subcategoryId) {
      return res
        .status(404)
        .json(createResponse(404, "Subcategory not found for this food ID."));
    }

    const { products, totalProducts } = await getSimilarProductsWithCount(
      subcategoryId,
      foodId,
      limit,
      offset
    );

    return res.status(200).json(
      createResponse(200, "Similar products fetched successfully.", {
        products,
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
        totalItems: totalProducts,
      })
    );
  } catch (error) {
    console.error(
      `Error fetching similar products for food ID ${foodId}:`,
      error
    );
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch similar products."));
  }
};
