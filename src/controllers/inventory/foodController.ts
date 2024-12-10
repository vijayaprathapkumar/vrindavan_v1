import { Request, Response } from "express";
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  updateStock,
} from "../../models/inventory/foodModel";
import { createResponse } from "../../utils/responseHandler";

export const fetchAllFoods = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  try {
    const { status, categoryId, subcategoryId, searchTerm } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const filters: any = {
      status,
      categoryId,
      subcategoryId,
      searchTerm: searchTerm ? searchTerm.toString() : null,
    };

    const { foods, totalCount } = await getAllFoods(filters, limit, offset);

    return res.status(200).json({
      statusCode: 200,
      message: "Foods fetched successfully",
      data: {
        foods,
        totalCount,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching foods:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching foods", error.message));
  }
};

// Get food by ID
export const fetchFoodById = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const foodId = parseInt(req.params.id);

  if (isNaN(foodId)) {
    return res.status(400).json(createResponse(400, "Invalid food ID"));
  }

  try {
    const { food } = await getFoodById(foodId);

    if (food) {
      const foodsData = [food];
      return res
        .status(200)
        .json(
          createResponse(200, "Food fetched successfully", { foods: foodsData })
        );
    } else {
      return res.status(404).json(createResponse(404, "Food not found"));
    }
  } catch (error) {
    console.error("Error fetching food:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching food", error.message));
  }
};

// Create food
export const addFood = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  try {
    const foodData = req.body;
    const newFood = await createFood(foodData);

    return res.status(201).json({
      statusCode: 201,
      message: "Food created successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error creating food:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error creating food", error.message));
  }
};

// Update food
export const modifyFood = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const foodId = parseInt(req.params.id);
  if (isNaN(foodId)) {
    return res.status(400).json(createResponse(400, "Invalid food ID"));
  }

  try {
    const foodData = req.body;
    const updatedFood = await updateFood(foodId, foodData);

    if (updatedFood) {
      return res.status(200).json({
        statusCode: 200,
        message: "Food updated successfully",
        data: {
          updateFood_id: updatedFood.id,
        },
      });
    } else {
      return res.status(404).json(createResponse(404, "Food not found"));
    }
  } catch (error) {
    console.error("Error updating food:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error updating food", error.message));
  }
};

// Delete food
export const removeFood = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>> | void> => {
  const foodId = parseInt(req.params.id);
  if (isNaN(foodId)) {
    return res.status(400).json(createResponse(400, "Invalid food ID"));
  }

  try {
    const deleted = await deleteFood(foodId);
    if (deleted) {
      return res.status(200).json({
        statusCode: 200,
        message: "Food deleted successfully",
        data: {
          deleteFood_id: foodId,
        },
      });
    } else {
      return res.status(404).json(createResponse(404, "Food not found"));
    }
  } catch (error) {
    console.error("Error deleting food:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error deleting food", error.message));
  }
};

// out of stock
export const modifyStock = async (req: Request, res: Response): Promise<Response> => {
  try {
   
    const { foodId, amount, description, type } = req.body;

    if (!["add", "sub"].includes(type)) {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid stock update type. Must be 'add' or 'sub'.",
      });
    }

    const amountChange = type === "add" ? amount : -Math.abs(amount);

    await updateStock( foodId, amountChange, description);

    return res.status(200).json({
      statusCode: 200,
      message: "Stock updated successfully",
    });
  } catch (error) {
    console.error("Error modifying stock:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error modifying stock",
      error: error.message,
    });
  }
};