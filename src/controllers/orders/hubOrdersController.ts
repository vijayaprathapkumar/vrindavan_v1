import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import { getAllHubOrders } from "../../models/orders/hubOrdersModel";

export const getHubOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;

    const searchTerm = (req.query.searchTerm as string) || null;
    const routeNameFilter = (req.query.routeName as string) || null;
    const foodNameFilter = (req.query.foodName as string) || null;
    const startDate = (req.query.startDate as string) || null;
    const endDate = (req.query.endDate as string) || null;

    const { totalRecords, orders } = await getAllHubOrders(
      limit,
      offset,
      searchTerm,
      routeNameFilter,
      foodNameFilter,
      startDate,
      endDate
    );

    res.status(200).json(
      createResponse(200, "Orders fetched successfully", {
        orders: orders,
        currentPage: page,
        limit: limit,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        
      })
    );
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching orders", error));
  }
};
