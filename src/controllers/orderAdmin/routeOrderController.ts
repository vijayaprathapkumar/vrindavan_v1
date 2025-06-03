import { Request, Response } from "express";
import {
  getAllFoodOrders,
  getFoodOrderSummary,
} from "../../models/orderAdmin/routeOrderModel";
import { createResponse } from "../../utils/responseHandler";

export const getFoodOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  const routeId =
    req.query.routeId && req.query.routeId !== "All"
      ? Number(req.query.routeId)
      : null;

  const productId =
    req.query.productId && req.query.productId !== "All"
      ? Number(req.query.productId)
      : null;

  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : null;

  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : null;

  const searchTerm = (req.query.searchTerm as string) || null;

  try {
    const { foodOrders, total } = await getAllFoodOrders(
      page,
      limit,
      routeId,
      productId,
      startDate,
      endDate,
      searchTerm
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      createResponse(200, "Food Orders fetched successfully", {
        foodOrders,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(500, "Error fetching food orders", {
        error: (error as Error).message || error,
      })
    );
  }
};


export const getFoodOrderSummaryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  const routeId =
    req.query.routeId && req.query.routeId !== "All"
      ? Number(req.query.routeId)
      : null;

  const productId =
    req.query.productId && req.query.productId !== "All"
      ? Number(req.query.productId)
      : null;

  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : null;

  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : null;

  const searchTerm = (req.query.searchTerm as string) || null;

  try {
    const { summaryData, total } = await getFoodOrderSummary(
      page,
      limit,
      routeId,
      productId,
      startDate,
      endDate,
      searchTerm
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      createResponse(200, "Food Order Summary fetched successfully", {
        summary: summaryData,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(500, "Error fetching food order summary", {
        error: (error as Error).message || error,
      })
    );
  }
};
