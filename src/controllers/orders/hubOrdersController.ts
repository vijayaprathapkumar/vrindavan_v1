import { Request, Response } from 'express';
import { createResponse } from '../../utils/responseHandler';
import { getAllHubOrders } from '../../models/orders/hubOrdersModel';


export const getHubOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getAllHubOrders();
    res.status(200).json(createResponse(200, 'Orders fetched successfully', orders));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error fetching orders', error));
  }
};

