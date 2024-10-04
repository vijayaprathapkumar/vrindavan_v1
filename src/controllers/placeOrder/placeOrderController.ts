import { Request, Response } from "express";
import {
  getAllPlaceOrders,
  addPlaceOrder,
  updatePlaceOrder,
  deletePlaceOrderById,
  getPriceForNextOrder,
} from "../../models/placeOrder/placeOrderModels";
import { createResponse } from "../../utils/responseHandler";

// Fetch all place orders for a user
export const fetchPlaceOrders = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const { total, placeOrders } = await getAllPlaceOrders(userId, page, limit);
    res.json(createResponse(200, "Place orders fetched successfully.", {
      placeOrders,
      totalRecords: total,
      page,
      limit,
    }));
  } catch (error) {
    console.error("Error fetching place orders:", error);
    res.status(500).json(createResponse(500, "Failed to fetch place orders."));
  }
};

export const addPlaceOrderController = async (req: Request, res: Response) => {
  const { userId } = req.body;

  try {

    const price = await getPriceForNextOrder(userId);
    
    if (!price) {
      return res.status(400).json(createResponse(400, "Price not found for the user."));
    }

    const status = "active"; 
    const method = "wallet"; 

    const result = await addPlaceOrder({
      price,
      userId,
      status,
      method,
    });

    if (result.affectedRows > 0) {
      res.status(201).json(createResponse(201, "Place order added successfully and wallet updated."));
    } else {
      res.status(400).json(createResponse(400, "Failed to add place order."));
    }
  } catch (error) {
    console.error("Error adding place order:", error);
    res.status(500).json(createResponse(500, "Failed to add place order."));
  }
};




// Update a place order and wallet balance
export const updatePlaceOrderController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { price, description } = req.body;

  const status = "active";
  const method = "wallet";

  try {
    await updatePlaceOrder(Number(id), { price, description, status, method });
    res.json(createResponse(200, "Place order updated and wallet balance adjusted."));
  } catch (error) {
    console.error("Error updating place order:", error);
    res.status(500).json(createResponse(500, "Failed to update place order."));
  }
};

// Delete a place order by ID
export const removePlaceOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deletePlaceOrderById(Number(id));
    res.json(createResponse(200, "Place order deleted successfully."));
  } catch (error) {
    console.error("Error deleting place order:", error);
    res.status(500).json(createResponse(500, "Failed to delete place order."));
  }
};
