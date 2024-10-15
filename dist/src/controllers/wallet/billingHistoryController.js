"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBillingHistory = void 0;
const billingHistoryModel_1 = require("../../models/wallet/billingHistoryModel");
const fetchBillingHistory = async (req, res) => {
    const userId = req.params.userId; // Extract userId from request parameters
    const page = parseInt(req.query.page) || 1; // Page number from query
    const limit = parseInt(req.query.limit) || 10; // Limit of records per page
    try {
        const total = await (0, billingHistoryModel_1.getTotalBillingHistoryCount)(userId);
        const billingHistory = await (0, billingHistoryModel_1.getOrderDetails)(userId, page, limit);
        res.status(200).json({
            total,
            page,
            limit,
            data: billingHistory,
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
exports.fetchBillingHistory = fetchBillingHistory;
