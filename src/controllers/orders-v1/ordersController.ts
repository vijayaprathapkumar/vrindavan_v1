import { Request, Response } from "express";
import {
  getAllOrders,
  updateOrder,
  deleteOrderById,
  getOrderById,
} from "../../models/orders-v1/ordersModel";
import { createResponse } from "../../utils/responseHandler";

export const fetchOrders = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10); 
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  if (isNaN(userId)) {
    return res.status(400).json(createResponse(400, "User ID is required and must be a number."));
  }

  try {
    const { total, orders } = await getAllOrders(userId, page, limit, startDate, endDate);
    res.json(createResponse(200, "Orders fetched successfully.", {
      orders,
      totalRecords: total,
      page,
      limit,
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json(createResponse(500, "Failed to fetch orders."));
  }
};

// Update an order
export const updateOrderController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const orderData = req.body;

  try {
    await updateOrder(Number(id), orderData);
    res.json(createResponse(200, "Order updated successfully."));
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json(createResponse(500, "Failed to update order."));
  }
};

// Delete an order by ID
export const removeOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteOrderById(Number(id));
    res.json(createResponse(200, "Order deleted successfully."));
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json(createResponse(500, "Failed to delete order."));
  }
};


// Fetch an order by ID
export const fetchOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const order = await getOrderById(Number(id));

    if (!order) {
      return res.status(404).json(createResponse(404, "Order not found."));
    }

    res.json(createResponse(200, "Order fetched successfully.", order));
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json(createResponse(500, "Failed to fetch order."));
  }
};
