import { Request, Response } from "express";
import {
  getAllPlaceOrders,
  updatePlaceOrder,
  deletePlaceOrderById,
  deleteAllCartItemsByUserId,
  getPlaceOrderById,
  addOrdersEntry,
  addFoodOrderEntry,
  getCartItemsByUserId,
} from "../../models/placeOrder/placeOrderModels";
import { createResponse } from "../../utils/responseHandler";

// Fetch all place orders for a user
export const fetchPlaceOrders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchTerm: string | null = req.query.searchTerm ? (req.query.searchTerm as string) : null;

  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  // Input validation
  if (isNaN(page) || page < 1) {
    return res.status(400).json(createResponse(400, "Invalid page number."));
  }
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json(createResponse(400, "Invalid limit number."));
  }

  try {
    const { total, placeOrders } = await getAllPlaceOrders(
      userId,
      page,
      limit,
      startDate,
      endDate,
      searchTerm
    );

    const totalPages = Math.ceil(total / limit);

    return res.json(
      createResponse(200, "Place orders fetched successfully.", {
        placeOrders,
        currentPage: page,
        limit,
        totalPages,
        totalRecords: total,
      })
    );
  } catch (error) {
    console.error("Error fetching place orders:", error);
    return res.status(500).json(createResponse(500, "Failed to fetch place orders."));
  }
};

// Add a place order and clear the cart
export const placeOneTimeOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, orderDate } = req.body;

  try {
    const cartItems = await getCartItemsByUserId(userId);
    if (!cartItems.length) {
      return res.status(400).json(createResponse(400, "No items in cart."));
    }

    const orderPromises = cartItems.map(async (item) => {
      if (item.quantity > 0) {
        await plcaeOrder(item, userId, orderDate); 
      } else {
        console.log("Failed to add place order.");
      }
    });

    await Promise.all(orderPromises);
    await deleteAllCartItemsByUserId(userId);

    return res
      .status(201)
      .json(
        createResponse(
          201,
          "Place order added successfully, cart cleared, and wallet updated.",
          null
        )
      );
  } catch (error) {
    console.error("Error adding place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to add place order."));
  }
};

const plcaeOrder = async (productData, user_id, orderDate) => {
  const { discount_price, price, food_id, quantity } = productData;
  const productAmount = discount_price ? discount_price : price;

  if (productAmount > 0) {
    const orderData: any = await addOrdersEntry(user_id, orderDate);
    if (orderData?.orderId) {
      await addFoodOrderEntry(
        productAmount,
        quantity,
        food_id,
        orderData.orderId
      );
      return;
    }
  }
  console.log("Failed to place order for item: " + food_id);
  return null;
};

// Update a place order
export const updateOneTimeOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { price, description } = req.body;

  const status = "active";
  const method = "wallet";

  try {
    await updatePlaceOrder(Number(id), { price, description, status, method });
    return res.json(
      createResponse(200, "Place order updated successfully.", null)
    );
  } catch (error) {
    console.error("Error updating place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to update place order."));
  }
};

// Delete a place order by ID
export const removePlaceOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    await deletePlaceOrderById(Number(id));
    return res.json(
      createResponse(200, "Place order deleted successfully.", null)
    );
  } catch (error) {
    console.error("Error deleting place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to delete place order."));
  }
};

// Fetch a place order by ID
export const fetchPlaceOrderById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  try {
    const placeOrder = await getPlaceOrderById(Number(id));

    if (!placeOrder) {
      return res
        .status(404)
        .json(createResponse(404, "Place order not found."));
    }

    return res.json(
      createResponse(200, "Place order fetched successfully.", { placeOrder })
    );
  } catch (error) {
    console.error("Error fetching place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch place order."));
  }
};
