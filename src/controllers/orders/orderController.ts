import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  deletePlaceOrderById,
  getAllOrders,
  getPlaceOrderById,
} from "../../models/orders/orderModel";

export const fetchAllOrders = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.userId);
  console.log("userId", userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchTerm: string | null = req.query.searchTerm
    ? (req.query.searchTerm as string)
    : null;

  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : undefined;
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : undefined;

  // Input validation
  if (isNaN(page) || page < 1) {
    return res.status(400).json(createResponse(400, "Invalid page number."));
  }
  if (isNaN(limit) || limit < 1) {
    return res.status(400).json(createResponse(400, "Invalid limit number."));
  }

  try {
    const { total, placeOrders } = await getAllOrders(
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
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch place orders."));
  }
};


export const fetchOrderById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);

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

// Delete a place order by ID
export const removeOrder = async (
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
