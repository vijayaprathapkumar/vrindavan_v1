"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOrderBillingHistoryForMobile = exports.fetchOrderBillingHistory = void 0;
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
    if (startDate && !isValidDate(startDate)) {
        return res
            .status(400)
            .json({ status: 400, message: "Invalid startDate format." });
    }
    if (endDate && !isValidDate(endDate)) {
        return res
            .status(400)
            .json({ status: 400, message: "Invalid endDate format." });
    }
    try {
        const total = await (0, billingHistoryModel_1.getTotalOrderBillingHistoryCount)(userId, startDate, endDate);
        const billingHistory = await (0, billingHistoryModel_1.getOrdersBilling)(userId, page, limit, startDate, endDate);
        res.status(200).json({
            status: 200,
            message: "Billing history retrieved successfully.",
            data: {
                totalCount: total,
                currentPage: page,
                limit: limit,
                walletBalance: billingHistory.currentBalance,
                walletLogs: billingHistory.walletLogs,
            },
        });
    }
    catch (error) {
        console.error("Error fetching billing history:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to retrieve billing history.",
            error: error.message,
        });
    }
};
exports.fetchOrderBillingHistory = fetchOrderBillingHistory;
// mobile api
const fetchOrderBillingHistoryForMobile = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const searchTerm = req.query.searchTerm;
    if (startDate && !isValidDate(startDate)) {
        return res
            .status(400)
            .json({ status: 400, message: "Invalid startDate format." });
    }
    if (endDate && !isValidDate(endDate)) {
        return res
            .status(400)
            .json({ status: 400, message: "Invalid endDate format." });
    }
    try {
        const total = await (0, billingHistoryModel_1.getTotalOrderBillingHistoryCount)(userId, startDate, endDate, searchTerm);
        const billingHistory = await (0, billingHistoryModel_1.getOrdersBillingForMobile)(userId, page, limit, startDate, endDate, searchTerm);
        // Calculate total pages
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            status: 200,
            message: "Billing history retrieved successfully.",
            data: {
                walletBalance: billingHistory.currentBalance,
                walletLogs: billingHistory.walletLogs,
                totalFoodCount: total,
                totalRecords: billingHistory.totalRecords,
                totalPages: totalPages,
                currentPage: page,
                limit: limit,
            },
        });
    }
    catch (error) {
        console.error("Error fetching billing history:", error);
        res.status(500).json({
            status: 500,
            message: "Failed to retrieve billing history.",
            error: error.message,
        });
    }
};
exports.fetchOrderBillingHistoryForMobile = fetchOrderBillingHistoryForMobile;
