import { Request, Response } from "express";
import { getOrderDetails, getTotalBillingHistoryCount } from "../../models/wallet/billingHistoryModel";

export const fetchBillingHistory = async (req: Request, res: Response) => {
  const userId = req.params.userId; // Extract userId from request parameters
  const page = parseInt(req.query.page as string) || 1; // Page number from query
  const limit = parseInt(req.query.limit as string) || 10; // Limit of records per page

  try {
    const total = await getTotalBillingHistoryCount(userId);
    const billingHistory = await getOrderDetails(userId, page, limit);

    res.status(200).json({
      total,
      page,
      limit,
      data: billingHistory,
    });
  } catch (error) {
    console.error("Error fetching billing history:", error);
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
