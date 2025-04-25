import { Request, Response } from "express";
import { getAllRouteOrders } from "../../models/orders/routeOrdersModel";
import { createResponse } from "../../utils/responseHandler";

export const getRouteOrders = async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string) || 1;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const routeName = (req.query.routeName as string) || "All Routes";
  const foodName = (req.query.foodName as string) || "All Products";
  const searchTerm = (req.query.searchTerm as string) || "";

  try {
    const orders = await getAllRouteOrders(
      page,
      limit,
      startDate,
      endDate,
      routeName,
      foodName,
      searchTerm
    );
    res
      .status(200)
      .json(createResponse(200, "Orders fetched successfully", orders));
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(500).json(createResponse(500, "Error fetching orders", error));
  }
};
