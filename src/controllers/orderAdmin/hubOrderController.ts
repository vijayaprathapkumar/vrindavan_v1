import { Request, Response } from "express";
import {
  getAllHubOrders,
  getHubOrderSummary,
} from "../../models/orderAdmin/hubOrderModel";
import { createResponse } from "../../utils/responseHandler";

export const getHubOrders = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

 const routeId = req.query.routeId
    ? parseInt(req.query.routeId as string)
    : null;
  const hubId = req.query.hubId ? parseInt(req.query.hubId as string) : null;
  const productId = req.query.productId !== "All" ? Number(req.query.productId) : null;

  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

  const searchTerm = (req.query.searchTerm as string) || null;

  try {
    const { hubOrders, total } = await getAllHubOrders(
      page, limit, routeId, productId, startDate, endDate, searchTerm,hubId
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      createResponse(200, "Hub Orders fetched successfully", {
        hubOrders,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(500, "Error fetching hub orders", {
        error: (error as Error).message,
      })
    );
  }
};

export const getHubOrderSummaryController = async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  const routeId = req.query.routeId !== "All" ? Number(req.query.routeId) : null;
  const productId = req.query.productId !== "All" ? Number(req.query.productId) : null;

  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

  const searchTerm = (req.query.searchTerm as string) || null;

  try {
    const { summaryData, total } = await getHubOrderSummary(
      page, limit, routeId, productId, startDate, endDate, searchTerm
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      createResponse(200, "Hub Order Summary fetched successfully", {
        summary: summaryData,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(500, "Error fetching hub order summary", {
        error: (error as Error).message,
      })
    );
  }
};
