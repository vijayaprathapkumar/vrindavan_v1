import { Request, Response } from "express";
import * as foodModel from "../../models/inventory/foodModel";
import { createResponse } from "../../utils/responseHandler";

export const getAllFoods = async (req: Request, res: Response) => {
  try {
    const { status, categoryId, subcategoryId, searchTerm, page = '1', limit = '10' } = req.query;
    
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    const filters = {
      status: status ? status === 'true' : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
      searchTerm: searchTerm ? String(searchTerm) : undefined,
    };

    const { foods, totalItems } = await foodModel.getAllFoods(filters, limitNumber, offset);

    const totalPages = Math.ceil(totalItems / limitNumber);

    res.status(200).json(
      createResponse(200, "Foods fetched successfully", {
        foods,
        pagination: {
          totalItems,
          totalPages,
          currentPage: pageNumber,
          pageSize: limitNumber,
        },
      })
    );
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching foods", error));
  }
};



export const getFoodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const food = await foodModel.getFoodById(Number(id));
    if (food) {
      res.status(200).json(createResponse(200, "Food fetched successfully", food));
    } else {
      res.status(404).json(createResponse(404, "Food not found"));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching food", error));
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const foodData = req.body;
    const newFood = await foodModel.createFood(foodData);
    res.status(201).json(createResponse(201, "Food created successfully", newFood));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating food", error));
  }
};

export const updateFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const foodData = req.body;
    const updatedFood = await foodModel.updateFood(Number(id), foodData);
    if (updatedFood) {
      res.status(200).json(createResponse(200, "Food updated successfully", updatedFood));
    } else {
      res.status(404).json(createResponse(404, "Food not found"));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating food", error));
  }
};

export const deleteFood = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await foodModel.deleteFood(Number(id));
    if (deleted) {
      res.status(200).json(createResponse(200, "Food deleted successfully"));
    } else {
      res.status(404).json(createResponse(404, "Food not found"));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting food", error));
  }
};
