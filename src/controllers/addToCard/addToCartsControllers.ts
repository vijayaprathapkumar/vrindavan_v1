import { Request, Response } from "express";
import {
  getAllCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItemById,
  getCountOfCartItems,
} from "../../models/addToCard/addToCartsModels";
import { createResponse } from "../../utils/responseHandler";
import { updatePaymentByUserId } from "../../models/addToCard/addToCartsModels";

// Fetch all cart items for a user and update the payments table
export const fetchCartItems = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1; 
  const limit = parseInt(req.query.limit as string) || 10; 

  // Calculate offset
  const offset = (page - 1) * limit;

  try {
    const cartItems = await getAllCartItems(userId, limit, offset);

    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.quantity > 0 ? item.food.price * item.quantity : item.food.price);
    }, 0);

    await updatePaymentByUserId(userId, totalPrice);

    const totalCartItems = await getCountOfCartItems(userId); 

    res.json(createResponse(200, "Cart items fetched and payment updated successfully.", {
      cartItems,
      totalPrice,
      currentPage: page,
      totalPages: Math.ceil(totalCartItems / limit),
      totalItems: totalCartItems
    }));
  } catch (error) {
    console.error("Error fetching cart items or updating payment:", error);
    res.status(500).json(createResponse(500, "Failed to fetch cart items or update payment."));
  }
};


// Add a new item to the cart and update the total price
export const addCart = async (req: Request, res: Response) => {
  const { userId, foodId, quantity } = req.body;

  try {
    await addCartItem({ userId, foodId, quantity });
    const cartItems = await getAllCartItems(userId, 10, 0);

    // Calculate total price considering quantity
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.quantity > 0 ? item.food.price * item.quantity : item.food.price);
    }, 0);

    await updatePaymentByUserId(userId, totalPrice);
    res.status(201).json(createResponse(201, "Item added to cart and payment updated."));
  } catch (error) {
    console.error("Error adding cart item:", error);
    res.status(500).json(createResponse(500, "Failed to add item to cart."));
  }
};

// Update an item in the cart and recalculate the total price
export const updateCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, userId } = req.body;

  try {
    await updateCartItem(Number(id), quantity);
    const cartItems = await getAllCartItems(userId, 10, 0);

    // Calculate total price considering quantity
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.quantity > 0 ? item.food.price * item.quantity : item.food.price);
    }, 0);

    await updatePaymentByUserId(userId, totalPrice);
    res.json(createResponse(200, "Cart item updated and payment adjusted."));
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json(createResponse(500, "Failed to update cart item."));
  }
};

// Delete a cart item and update the payment total price
export const removeCart = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    await deleteCartItemById(Number(id));
    const cartItems = await getAllCartItems(user_id, 10, 0);

    // Calculate total price considering quantity
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.quantity > 0 ? item.food.price * item.quantity : item.food.price);
    }, 0);

    await updatePaymentByUserId(user_id, totalPrice);
    res.json(createResponse(200, "Cart item removed and payment updated."));
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json(createResponse(500, "Failed to remove cart item."));
  }
};

