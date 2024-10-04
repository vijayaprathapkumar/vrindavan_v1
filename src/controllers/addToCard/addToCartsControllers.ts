import { Request, Response } from "express";
import {
  getAllCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItemById,
} from "../../models/addToCard/addToCartsModels";
import { createResponse } from "../../utils/responseHandler";
import { OkPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

// Fetch all cart items for a user and update the payments table
export const fetchCartItems = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  try {
    const cartItems = await getAllCartItems(userId);

    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.food.price * item.quantity;
    }, 0);

    await updatePaymentByUserId(userId, totalPrice);

    res.json(
      createResponse(200, "Cart items fetched and payment updated successfully.", {
        cartItems,
        totalPrice,
      })
    );
  } catch (error) {
    console.error("Error fetching cart items or updating payment:", error);
    res.status(500).json(createResponse(500, "Failed to fetch cart items or update payment."));
  }
};

// Update the payment total for a user in the payments table
export const updatePaymentByUserId = async (userId: number, totalPrice: number): Promise<void> => {
  const updateSql = `
    UPDATE payments 
    SET price = ?, updated_at = NOW() 
    WHERE user_id = ? AND status = 'active';
  `;

  const insertSql = `
    INSERT INTO payments (user_id, price, status, created_at, updated_at) 
    VALUES (?, ?, 'active', NOW(), NOW());
  `;

  try {

    const [updateResult]: [OkPacket, any] = await db.promise().query(updateSql, [totalPrice, userId]);

    if (updateResult.affectedRows === 0) {

      await db.promise().query(insertSql, [userId, totalPrice]);
    }
  } catch (error) {
    console.error("Error updating or inserting payment:", error);
    throw new Error("Failed to update or insert payment.");
  }
};


// Add a new item to the cart and update the total price
export const addCart = async (req: Request, res: Response) => {
  const { userId, foodId, quantity } = req.body;

  try {
    await addCartItem({ userId, foodId, quantity });
    const cartItems = await getAllCartItems(userId);

    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.food.price * item.quantity;
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

  
    const cartItems = await getAllCartItems(userId);

    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.food.price * item.quantity;
    }, 0);

    // Update the payment with the new total price
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
  const { userId } = req.body;

  try {
    await deleteCartItemById(Number(id));

    const cartItems = await getAllCartItems(userId);

    const totalPrice = cartItems.reduce((total, item) => {
      return total + item.food.price * item.quantity;
    }, 0);

    await updatePaymentByUserId(userId, totalPrice);

    res.json(createResponse(200, "Cart item removed and payment updated."));
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json(createResponse(500, "Failed to remove cart item."));
  }
};
