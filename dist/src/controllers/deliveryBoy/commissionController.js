"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommissionController = exports.getDetailedCommission = exports.getDetailedCommissions = void 0;
const commissionModel_1 = require("../../models/deliveryBoy/commissionModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getDetailedCommissions = async (req, res) => {
    const searchTerm = req.query.searchTerm || "";
    const categoryId = req.query.categoryId || "";
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "";
    try {
        const result = await (0, commissionModel_1.getAllDetailedCommissions)(searchTerm, limit, offset, categoryId, sortField, sortOrder);
        const data = result.data;
        const totalCount = result.totalCount;
        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Detailed commissions fetched successfully", {
            commissions: data,
            totalCount,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching detailed commissions", error));
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
const updateCommissionController = async (req, res) => {
    const { commissionId } = req.params;
    const { commissionValue } = req.body;
    try {
        const updatedCommission = await (0, commissionModel_1.updateCommission)(commissionId, commissionValue);
        if (updatedCommission) {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Commission updated successfully", updatedCommission));
        }
        else {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Commission not found"));
        }
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating commission", error));
    }
};
exports.updateCommissionController = updateCommissionController;
