import { Request, Response } from "express";
import {
  getAllCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItemById,
} from "../../models/addToCard/addToCartsModels";
import { createResponse } from "../../utils/responseHandler";

// Fetch all cart items for a user
export const fetchCartItems = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  try {
    const cartItems = await getAllCartItems(userId);
    res.json(
      createResponse(200, "Cart items fetched successfully.", cartItems)
    );
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to fetch cart items."));
  }
};

// Add a new cart item
export const addCart = async (req: Request, res: Response) => {
  const { foodId, userId, quantity, specialInstructions } = req.body;

  try {
    const result = await addCartItem({ foodId, userId, quantity });

    if (result.affectedRows > 0) {
      res
        .status(201)
        .json(createResponse(201, "Cart item added successfully."));
    } else {
      res.status(400).json(createResponse(400, "Failed to add cart item."));
    }
  } catch (error) {
    console.error("Error adding cart item:", error);
    res.status(500).json(createResponse(500, "Failed to add cart item."));
  }
};

// Update a cart item
export const updateCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await updateCartItem(Number(id), quantity);
    res.json(createResponse(200, "Cart item updated successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to update cart item."));
  }
};

// Delete a cart item by ID
export const removeCart = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteCartItemById(Number(id));
    res.json(createResponse(200, "Cart item deleted successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to delete cart item."));
  }
};
