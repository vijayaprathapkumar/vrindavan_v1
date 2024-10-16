import { Request, Response } from "express";
import {  getOrdersBilling, getTotalOrderBillingHistoryCount } from "../../models/wallet/billingHistoryModel";

// export const fetchBillingHistory = async (req: Request, res: Response) => {
//   const userId = req.params.userId; // Extract userId from request parameters
//   const page = parseInt(req.query.page as string) || 1; // Page number from query
//   const limit = parseInt(req.query.limit as string) || 10; // Limit of records per page

//   try {
//     const total = await getTotalBillingHistoryCount(userId);
//     const billingHistory = await getOrderDetails(userId, page, limit);

//     res.status(200).json({
//       total,
//       page,
//       limit,
//       data: billingHistory,
//     });
//   } catch (error) {
//     console.error("Error fetching billing history:", error);
//     res.status(500).json({
//       status: 500,
//       message: error.message,
//     });
//   }
// };



/// working
const isValidDate = (dateString: string) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const fetchOrderBillingHistory = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1; 
  const limit = parseInt(req.query.limit as string) || 10; 
  const startDate = req.query.startDate as string; 
  const endDate = req.query.endDate as string;

  // Check if startDate and endDate are valid dates
  if (startDate && !isValidDate(startDate)) {
    return res.status(400).json({ status: 400, message: "Invalid startDate format." });
  }

  if (endDate && !isValidDate(endDate)) {
    return res.status(400).json({ status: 400, message: "Invalid endDate format." });
  }

  try {
    const total = await getTotalOrderBillingHistoryCount(userId, startDate, endDate); 
    const billingHistory = await getOrdersBilling(userId, page, limit, startDate, endDate);

    res.status(200).json({
      totalCount: total, // Total count of billing history entries
      currentPage: page, // Current page number
      limit: limit, // Number of entries per page
      data: billingHistory, // The actual billing history data
    });
  } catch (error) {
    console.error("Error fetching billing history:", error);
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};
