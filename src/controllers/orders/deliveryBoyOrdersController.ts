import { Request, Response } from 'express';
import { createResponse } from '../../utils/responseHandler';
import { getAllDeliveryBoyOrders } from '../../models/orders/deliveryBoysOrdersModel';

export const getDeliveryBoyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getAllDeliveryBoyOrders();
    res.status(200).json(createResponse(200, 'Orders fetched successfully', orders));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error fetching orders', error));
  }
};

