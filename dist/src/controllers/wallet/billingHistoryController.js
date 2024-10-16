"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOrderBillingHistory = void 0;
const billingHistoryModel_1 = require("../../models/wallet/billingHistoryModel");
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
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};
const fetchOrderBillingHistory = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    // Check if startDate and endDate are valid dates
    if (startDate && !isValidDate(startDate)) {
        return res.status(400).json({ status: 400, message: "Invalid startDate format." });
    }
    if (endDate && !isValidDate(endDate)) {
        return res.status(400).json({ status: 400, message: "Invalid endDate format." });
    }
    try {
        const total = await (0, billingHistoryModel_1.getTotalOrderBillingHistoryCount)(userId, startDate, endDate);
        const billingHistory = await (0, billingHistoryModel_1.getOrdersBilling)(userId, page, limit, startDate, endDate);
        res.status(200).json({
            totalCount: total, // Total count of billing history entries
            currentPage: page, // Current page number
            limit: limit, // Number of entries per page
            data: billingHistory, // The actual billing history data
        });
    }
    catch (error) {
        console.error("Error fetching billing history:", error);
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
};
exports.fetchOrderBillingHistory = fetchOrderBillingHistory;
