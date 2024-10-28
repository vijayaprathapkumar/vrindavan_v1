import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  deletePlaceOrderById,
  getAllOrders,
  getPlaceOrderById,
  updateOneTimeOrders,
  updateSubscriptionOrders,
} from "../../models/orders/orderModel";
import moment from "moment";

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


//update  Qnty Change
export const updateOrderqty = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { orderId, quantity, orderDate, orderType, subcriptionId } = req.body;

  // Validate orderId and subcriptionId presence and number
  if (isNaN(orderId) || (orderType === 2 && isNaN(subcriptionId))) {
    return res.status(400).json(createResponse(400, "Order ID or Subscription ID is missing or incorrect."));
  }

  // Validate quantity and orderDate
  if ((quantity === undefined || quantity === null) && (orderDate === undefined || orderDate === null)) {
    return res.status(400).json(createResponse(400, "Quantity or Order Date is missing."));
  }

  // Check orderDate format
  if (orderDate && !moment(orderDate, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json(createResponse(400, "Order date is incorrect."));
  }

  // Check quantity type
  if (quantity !== undefined && isNaN(quantity)) {
    return res.status(400).json(createResponse(400, "Quantity is incorrect."));
  }

  // Check subcriptionId type for subscription orders
  if (orderType === 2 && isNaN(subcriptionId)) {
    return res.status(400).json(createResponse(400, "Subscription ID is incorrect."));
  }

  try {
    if (orderType === 1) {
      await updateOneTimeOrders(orderId, quantity, orderDate);
    } else if (orderType === 2) {
      await updateSubscriptionOrders(subcriptionId, quantity, orderDate);
    } else {
      return res.status(400).json(createResponse(400, "Invalid order type."));
    }

    return res.json(createResponse(200, "Order updated successfully."));
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json(createResponse(500, "Failed to update order."));
  }
};


// Delete a place order by ID
export const removeOrder = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  if (isNaN(Number(id)) || Number(id) <= 0) {
    return res.status(400).json(createResponse(400, "Invalid ID. It must be a positive number."));
  }

  try {
    await deletePlaceOrderById(Number(id));
    return res.json(createResponse(200, "Order deleted successfully.", null));
  } catch (error) {
    console.error("Error deleting place order:", error);
    return res.status(500).json(createResponse(500, "Failed to delete place order."));
  }
};