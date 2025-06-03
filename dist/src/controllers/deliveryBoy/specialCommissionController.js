"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSpecialCommissionController = exports.getDetailedSpecialCommission = exports.getDetailedSpecialCommissions = exports.addSpecialCommissionController = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const specialCommissionModel_1 = require("../../models/deliveryBoy/specialCommissionModel");
const addSpecialCommissionController = async (req, res) => {
    const { categoryId, productId, standardCommission, specialCommission, deliveryBoyId } = req.body;
    if (!categoryId || !productId || !standardCommission || !specialCommission || !deliveryBoyId) {
        res.status(400).json({ message: "All fields are required" });
        return;
    }
    try {
        const commissionId = await (0, specialCommissionModel_1.addSpecialCommission)(categoryId, productId, standardCommission, specialCommission, deliveryBoyId);
        res.status(201).json({
            message: "Special commission created successfully",
            commissionId,
        });
    }
    catch (error) {
        console.error("Error creating special commission:", error);
        res.status(500).json({ message: "Error creating special commission" });
    }
};
exports.addSpecialCommissionController = addSpecialCommissionController;
const getDetailedSpecialCommissions = async (req, res) => {
    const searchTerm = req.query.searchTerm || "";
    const categoryId = req.query.categoryId || "";
    const deliveryBoyId = req.query.deliveryBoyId || "";
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sortField = req.query.sortField || '';
    const sortOrder = req.query.sortOrder || '';
    const offset = (page - 1) * limit;
    try {
        const result = await (0, specialCommissionModel_1.getAllDetailedSpecialCommissions)(searchTerm, limit, offset, categoryId, deliveryBoyId, sortField, sortOrder);
        const data = result.data;
        const totalCount = result.totalCount;
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Detailed special commissions fetched successfully", {
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
            .json((0, responseHandler_1.createResponse)(500, "Error fetching detailed special commissions", error));
    }
};
exports.getDetailedSpecialCommissions = getDetailedSpecialCommissions;
const getDetailedSpecialCommission = async (req, res) => {
    const { id } = req.params;
    try {
        const commission = await (0, specialCommissionModel_1.getDetailedSpecialCommissionById)(parseInt(id));
        if (!commission) {
            res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Detailed special commission not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Detailed special commission fetched successfully", commission));
        }
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching detailed special commission", error));
    }
};
exports.getDetailedSpecialCommission = getDetailedSpecialCommission;
const updateSpecialCommissionController = async (req, res) => {
    const { id } = req.params;
    const { categoryId, productId, standardCommission, specialCommission, deliveryBoyId } = req.body;
    try {
        const updatedCommission = await (0, specialCommissionModel_1.updateSpecialCommission)(id, categoryId, productId, standardCommission, specialCommission, deliveryBoyId);
        res.status(200).json({
            message: "Special commission updated successfully",
            data: updatedCommission,
        });
    }
    catch (error) {
        console.error('Error updating special commission:', error);
        res.status(500).json({
            message: "Error updating special commission",
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
};
exports.updateSpecialCommissionController = updateSpecialCommissionController;
