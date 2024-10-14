import { Request, Response } from "express";
import {
  getAllPlaceOrders,
  addPlaceOrder,
  updatePlaceOrder,
  deletePlaceOrderById,
  getPriceForNextOrder,
  deleteAllCartItemsByUserId,
  getPlaceOrderById,
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
  const searchTerm = req.query.searchTerm ? (req.query.searchTerm as string) : null;

  try {
    const { total, placeOrders } = await getAllPlaceOrders(userId, page, limit, searchTerm);
    return res.json(
      createResponse(200, "Place orders fetched successfully.", {
        placeOrders,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
      })
    );
  } catch (error) {
    console.error("Error fetching place orders:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch place orders."));
  }
};


// Add a place order and clear the cart
export const addPlaceOrderController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.body;

  try {
    const price = await getPriceForNextOrder(userId);
    if (!price) {
      return res
        .status(400)
        .json(createResponse(400, "Price not found for the user."));
    }

    const status = "active";
    const method = "wallet";

    const result = await addPlaceOrder({ price, userId, status, method });
    if (result.affectedRows > 0) {
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
    } else {
      return res
        .status(400)
        .json(createResponse(400, "Failed to add place order."));
    }
  } catch (error) {
    console.error("Error adding place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to add place order."));
  }
};

// Update a place order
export const updatePlaceOrderController = async (
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

    const responce = { placeOrder: [placeOrder] };
    return res.json(
      createResponse(200, "Place order fetched successfully.", responce)
    );
  } catch (error) {
    console.error("Error fetching place order:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch place order."));
  }
};
