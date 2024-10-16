import { Request, Response } from "express";
import {
  getAllCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItemById,
  getCountOfCartItems,
  updatePaymentByUserId,
  getCartItemById,
} from "../../models/addToCard/addToCartsModels";
import { createResponse } from "../../utils/responseHandler";
    
// Fetch all cart items for a user and update the payments table
export const fetchCartItems = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const cartItems = await getAllCartItems(userId, limit, offset);

    const totalPrice = cartItems.reduce((total, item) => {
      const itemPrice = item.food.discountPrice || item.food.price; 
      return total + itemPrice * item.quantity;
    }, 0);


    const totalCartItems = await getCountOfCartItems(userId);

    return res.status(200).json(
      createResponse(200, "Cart items fetched successfully.", {
        cart: cartItems,
        totalPrice,
        currentPage: page,
        limit,
        totalPages: Math.ceil(totalCartItems / limit),
        totalItems: totalCartItems,
      })
    );
  } catch (error) {
    console.error("Error fetching cart items or updating payment:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "Failed to fetch cart items or update payment.")
      );
  }
};

// Add a new item to the cart 
export const addCart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, foodId, quantity } = req.body;

  if (quantity <= 0) {
    return res
      .status(400)
      .json(createResponse(400, "Quantity must be at least 1."));
  }

  try {
    await addCartItem({ userId, foodId, quantity });

    const cartItems = await getAllCartItems(userId, 10, 0);


    const totalPrice = cartItems.reduce((total, item) => {

      const itemPrice = item.food.discountPrice || item.food.price; 
      return total + itemPrice * item.quantity;
    }, 0);

    return res
      .status(201)
      .json(createResponse(201, "Item added to cart successfully.", { totalPrice }));
  } catch (error) {
    console.error("Error adding cart item:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to add item to cart."));
  }
};



// Fetch a cart item by its ID
export const fetchCartItemById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const cartItem = await getCartItemById(Number(id));

    if (!cartItem) {
      return res.status(404).json(createResponse(404, "Cart item not found."));
    }
    const responseCarts = { carts: [cartItem] };
    return res.status(200).json(createResponse(200, "Cart item fetched successfully.", responseCarts));
  } catch (error) {
    console.error("Error fetching cart item:", error);
    return res.status(500).json(createResponse(500, "Failed to fetch cart item."));
  }
};


// Update an item in the cart and recalculate the total price
export const updateCart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { quantity, userId } = req.body;

  if (quantity <= 0) {
    return res
      .status(400)
      .json(createResponse(400, "Quantity must be at least 1."));
  }

  try {
    await updateCartItem(Number(id), quantity);
    const cartItems = await getAllCartItems(userId, 10, 0);

    
    const totalPrice = cartItems.reduce((total, item) => {
      const itemPrice = item.food.discountPrice || item.food.price; 
      return total + itemPrice * item.quantity;
    }, 0);

    // await updatePaymentByUserId(userId, totalPrice);
    return res.status(200).json(
      createResponse(200, "Cart item updated successfully.", null)
    );
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to update cart item."));
  }
};

// Delete a cart item and update the payment total price
export const removeCart = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await deleteCartItemById(Number(id));
    const cartItems = await getAllCartItems(userId, 10, 0);

   
    const totalPrice = cartItems.reduce((total, item) => {
      const itemPrice = item.food.discountPrice || item.food.price; 
      return total + itemPrice * item.quantity;
    }, 0);

    // await updatePaymentByUserId(userId, totalPrice);
    return res
      .status(200)
      .json(createResponse(200, "Cart item removed successfully.", null));
  } catch (error) {
    console.error("Error removing cart item:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to remove cart item."));
  }
};
