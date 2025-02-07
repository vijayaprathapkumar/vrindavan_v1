"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommissionPayouts = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const commissionPayoutModel_1 = require("../../models/deliveryBoy/commissionPayoutModel");
const getCommissionPayouts = async (req, res) => {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "asc";
    const searchTerm = req.query.searchTerm || "";
    if (!month || !year) {
        res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Missing required query parameters"));
        return;
    }
    try {
        const { commissionPayouts, totalCount } = await (0, commissionPayoutModel_1.getMonthlyCommissionPayouts)(month, year, limit, offset, sortField, sortOrder, searchTerm);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Commission payouts fetched successfully", {
            commissionPayouts,
            totalCount,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching commission payouts", error));
    }
};
exports.getCommissionPayouts = getCommissionPayouts;
