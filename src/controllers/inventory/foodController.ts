import { Request, Response } from "express";
import {
  getAllFoods,
  createFood,
  getFoodById,
  updateFoodById,
  deleteFoodById
} from "../../models/inventory/foodModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all foods
export const getFoods = async (req: Request, res: Response): Promise<void> => {
  try {
    const foods = await getAllFoods();
    res.status(200).json(createResponse(200, "Foods fetched successfully", foods));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching foods", error));
  }
};

// Add a new food
export const addFood = async (req: Request, res: Response): Promise<void> => {
  const {
    name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode,
    cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id,
    subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality
  } = req.body;
  try {
    await createFood(name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode,
      cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id,
      subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality);
    res.status(201).json(createResponse(201, "Food created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating food", error));
  }
};

// Get food by ID
export const getFood = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const food = await getFoodById(parseInt(id));
    if (food.length === 0) {
      res.status(404).json(createResponse(404, "Food not found"));
    } else {
      res.status(200).json(createResponse(200, "Food fetched successfully", food));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching food", error));
  }
};

// Update food by ID
export const updateFood = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode,
    cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id,
    subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality
  } = req.body;
  try {
    await updateFoodById(parseInt(id), name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode,
      cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id,
      subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality);
    res.status(200).json(createResponse(200, "Food updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating food", error));
  }
};

// Delete food by ID
export const deleteFood = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteFoodById(parseInt(id));
    res.status(200).json(createResponse(200, "Food deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting food", error));
  }
};
