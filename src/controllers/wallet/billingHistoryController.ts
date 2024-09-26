import { Request, Response } from "express";
import { getBillingHistory, getTotalBillingHistoryCount } from "../../models/wallet/billingHistoryModel";
import { createResponse } from "../../utils/responseHandler";

export const fetchBillingHistory = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
        return res.status(400).json(createResponse(400, "Invalid user ID."));
    }

    const page = parseInt(req.query.page as string) || 1;  
    const limit = parseInt(req.query.limit as string) || 10; 

    try {
        const billingHistory = await getBillingHistory(userId, page, limit);
        const totalRecords = await getTotalBillingHistoryCount(userId);

        res.json(createResponse(200, "Billing history fetched successfully.", {
            billingHistory,
            totalRecords,
            currentPage: page,
            limit
        }));
    } catch (error) {
        console.error("Error fetching billing history:", error);
        res.status(500).json(createResponse(500, "Failed to fetch billing history.", error.message));
    }
};
