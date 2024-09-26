"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBillingHistory = void 0;
const billingHistoryModel_1 = require("../../models/wallet/billingHistoryModel");
const responseHandler_1 = require("../../utils/responseHandler");
const fetchBillingHistory = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid user ID."));
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const billingHistory = await (0, billingHistoryModel_1.getBillingHistory)(userId, page, limit);
        const totalRecords = await (0, billingHistoryModel_1.getTotalBillingHistoryCount)(userId);
        res.json((0, responseHandler_1.createResponse)(200, "Billing history fetched successfully.", {
            billingHistory,
            totalRecords,
            currentPage: page,
            limit
        }));
    }
    catch (error) {
        console.error("Error fetching billing history:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch billing history.", error.message));
    }
};
exports.fetchBillingHistory = fetchBillingHistory;
