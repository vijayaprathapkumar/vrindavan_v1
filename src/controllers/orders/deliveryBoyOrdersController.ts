import { Request, Response } from 'express';
import { createResponse } from '../../utils/responseHandler';
import { getAllDeliveryBoyOrders } from '../../models/orders/deliveryBoysOrdersModel';

export const getDeliveryBoyOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.searchTerm as string || '';
    const localityId = req.query.localityId ? parseInt(req.query.localityId as string) : null;
    const foodName = req.query.foodName as string || null;
    const startDate = req.query.startDate as string || null;
    const endDate = req.query.endDate as string || null;

    const { data, totalRecords } = await getAllDeliveryBoyOrders(page, limit, searchTerm, localityId, foodName, startDate, endDate);

    const totalPages = Math.ceil(totalRecords / limit);

    res.status(200).json(createResponse(200, 'Orders fetched successfully', {
      orders: data,
      pagination: {
        totalRecords,
        page,
        limit,
        currentPage: page,
        totalPages
      }
    }));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error fetching orders', error));
  }
};