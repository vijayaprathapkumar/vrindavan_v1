"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetailedCommission = exports.getDetailedCommissions = void 0;
const commissionModel_1 = require("../../models/deliveryBoy/commissionModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getDetailedCommissions = async (req, res) => {
    const searchTerm = req.query.searchTerm || '';
    const categoryId = req.query.categoryId || ''; // Category filter
    const limit = parseInt(req.query.limit) || 10; // Ensure this is a number
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    try {
        const result = await (0, commissionModel_1.getAllDetailedCommissions)(searchTerm, limit, offset, categoryId);
        const data = result.data;
        const totalCount = result.totalCount;
        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Detailed commissions fetched successfully", {
            commissions: data,
            totalCount,
            totalPages,
            currentPage: page,
            recordsPerPage: limit,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching detailed commissions", error));
    }
};
exports.getDetailedCommissions = getDetailedCommissions;
const getDetailedCommission = async (req, res) => {
    const { id } = req.params;
    try {
        const commission = await (0, commissionModel_1.getDetailedCommissionById)(parseInt(id));
        if (!commission) {
            res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Detailed commission not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Detailed commission fetched successfully", commission));
        }
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching detailed commission", error));
    }
};
exports.getDetailedCommission = getDetailedCommission;
