import { Request, Response } from "express";

import { createResponse } from "../../utils/responseHandler";
import {
  getLocalityOrdersAdmin,
  getLocalityOrderSummaryAdmin,
} from "../../models/orderAdmin/localityOrderModel";

export const getLocalityOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const localityId = req.query.localityId ? Number(req.query.localityId) : null;
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : null;
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : null;
  const searchTerm = (req.query.searchTerm as string) || null;

  const productId =
    req.query.productId !== "All" ? Number(req.query.productId) : null;

  try {
    const { orders, total } = await getLocalityOrdersAdmin(
      page,
      limit,
      localityId,
      startDate,
      endDate,
      searchTerm,
      productId
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      createResponse(200, "Locality orders fetched successfully", {
        localityOrders: orders,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(500, "Error fetching locality orders", {
        error: (error as Error).message,
      })
    );
  }
};

export const getLocalityOrderSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const localityId = req.query.localityId ? Number(req.query.localityId) : null;
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : null;
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : null;
  const searchTerm = (req.query.searchTerm as string) || null;

  try {
    const { summaryData, total } = await getLocalityOrderSummaryAdmin(
      page,
      limit,
      localityId,
      startDate,
      endDate,
      searchTerm
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      createResponse(200, "Locality order summary fetched successfully", {
        summary: summaryData,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
      })
    );
  } catch (error) {
    res.status(500).json(
      createResponse(500, "Error fetching locality order summary", {
        error: (error as Error).message,
      })
    );
  }
};
