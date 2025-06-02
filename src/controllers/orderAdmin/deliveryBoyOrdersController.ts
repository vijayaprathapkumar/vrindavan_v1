import { Request, Response } from "express";
import {
  getDeliveryBoyOrders,
  getDeliveryBoyOrderSummary,
} from "../../models/orderAdmin/deliveryBoyOrdersModel";
import { createResponse } from "../../utils/responseHandler";

export const fetchDeliveryBoyOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const deliveryBoyId = req.query.deliveryBoyId
      ? parseInt(req.query.deliveryBoyId as string)
      : null;
    const productId =
      req.query.productId !== "All" ? Number(req.query.productId) : null;

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : null;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : null;
    const searchTerm = req.query.searchTerm
      ? (req.query.searchTerm as string)
      : null;

    const { orders, total } = await getDeliveryBoyOrders(
      page,
      limit,
      deliveryBoyId,
      startDate,
      endDate,
      searchTerm,
      productId
    );

    return res.status(200).json(
      createResponse(200, "Delivery boy orders fetched successfully", {
        deliveryOrders: orders,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error("Error fetching delivery boy orders:", error);
    return res
      .status(500)
      .json(createResponse(500, "Internal server error", null));
  }
};
export const fetchDeliveryBoyOrderSummary = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const deliveryBoyId = req.query.deliveryBoyId
      ? parseInt(req.query.deliveryBoyId as string)
      : null;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : null;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : null;
    const searchTerm = req.query.searchTerm
      ? (req.query.searchTerm as string)
      : null;

    const productId =
      req.query.productId !== "All" ? Number(req.query.productId) : null;

    const { summary, total } = await getDeliveryBoyOrderSummary(
      page,
      limit,
      deliveryBoyId,
      startDate,
      endDate,
      searchTerm,
      productId
    );

    return res.status(200).json(
      createResponse(200, "Delivery boy order summary fetched successfully", {
        summary,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    );
  } catch (error) {
    console.error("Error fetching delivery boy order summary:", error);
    return res
      .status(500)
      .json(createResponse(500, "Internal server error", null));
  }
};
