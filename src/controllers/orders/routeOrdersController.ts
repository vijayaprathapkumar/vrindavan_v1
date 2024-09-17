import { Request, Response } from 'express';
import { getAllOrders, getOrderById, createOrderInDb, updateOrderInDb, deleteOrderInDb } from '../../models/orders/routeOrdersModel';
import { createResponse } from '../../utils/responseHandler';

// Get all orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    res.status(200).json(createResponse(200, 'Orders fetched successfully', orders));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error fetching orders', error));
  }
};


// Get a single order by ID
export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const order = await getOrderById(parseInt(id));
    if (!order) {
      res.status(404).json(createResponse(404, 'Order not found'));
    } else {
      res.status(200).json(createResponse(200, 'Order fetched successfully', order));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error fetching order', error));
  }
};


// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const newOrder = await createOrderInDb(req.body);
    res.status(201).json(createResponse(201, 'Order created successfully', newOrder));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error creating order', error));
  }
};

// Update an existing order
export const updateOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedOrder = await updateOrderInDb(parseInt(id), req.body);
    if (updatedOrder.affectedRows === 0) {
      res.status(404).json(createResponse(404, 'Order not found'));
    } else {
      res.status(200).json(createResponse(200, 'Order updated successfully', updatedOrder));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error updating order', error));
  }
};

// Delete an order by ID
export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await deleteOrderInDb(parseInt(id));
    if (result.affectedRows === 0) {
      res.status(404).json(createResponse(404, 'Order not found'));
    } else {
      res.status(200).json(createResponse(200, 'Order deleted successfully'));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error deleting order', error));
  }
};
