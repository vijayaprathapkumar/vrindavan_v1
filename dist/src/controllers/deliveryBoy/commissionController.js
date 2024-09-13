"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDetailedCommission = exports.updateDetailedCommission = exports.addDetailedCommission = exports.getDetailedCommission = exports.getDetailedCommissions = void 0;
const commissionModel_1 = require("../../models/deliveryBoy/commissionModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getDetailedCommissions = async (req, res) => {
    try {
        const commissions = await (0, commissionModel_1.getAllDetailedCommissions)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Detailed commissions fetched successfully", commissions));
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
        if (commission.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Detailed commission not found"));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "Detailed commission fetched successfully", commission));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching detailed commission", error));
    }
};
exports.getDetailedCommission = getDetailedCommission;
const addDetailedCommission = async (req, res) => {
    const { monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year } = req.body;
    try {
        await (0, commissionModel_1.createDetailedCommission)(monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Detailed commission created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating detailed commission", error));
    }
};
exports.addDetailedCommission = addDetailedCommission;
const updateDetailedCommission = async (req, res) => {
    const { id } = req.params;
    const { monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year } = req.body;
    try {
        await (0, commissionModel_1.updateDetailedCommissionById)(parseInt(id), monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Detailed commission updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating detailed commission", error));
    }
};
exports.updateDetailedCommission = updateDetailedCommission;
const deleteDetailedCommission = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, commissionModel_1.deleteDetailedCommissionById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Detailed commission deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting detailed commission", error));
    }
};
exports.deleteDetailedCommission = deleteDetailedCommission;
