"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeliveryAddress = exports.updateDeliveryAddress = exports.getDeliveryAddresses = void 0;
const deliveryAddressesModel_1 = require("../../models/customer/deliveryAddressesModel");
const getDeliveryAddresses = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm
        ? req.query.searchTerm
        : "";
    const sortField = req.query.sortField || "created_at";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
    try {
        const { deliveryAddresses, total } = await (0, deliveryAddressesModel_1.getDeliveryAddress)(page, limit, searchTerm, sortField, sortOrder);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json({
            statusCode: 200,
            message: "Delivery addresses fetched successfully",
            data: {
                deliveryAddresses,
                totalCount: total,
                currentPage: page,
                limit,
                totalPages,
                sortField,
                sortOrder,
            },
        });
    }
    catch (error) {
        console.error("Error fetching delivery addresses:", error.message);
        res.status(500).json({
            statusCode: 500,
            message: "Error fetching delivery addresses",
            error: error.message,
        });
    }
};
exports.getDeliveryAddresses = getDeliveryAddresses;
const updateDeliveryAddress = async (req, res) => {
    const { id } = req.params;
    const { locality_id, approveStatus } = req.body;
    if (locality_id === undefined || approveStatus === undefined) {
        res.status(400).json({
            statusCode: 400,
            message: "Missing required fields: locality_id, or approveStatus",
        });
        return;
    }
    try {
        const updatedDeliveryAddress = await (0, deliveryAddressesModel_1.updateDeliveryAddressById)(parseInt(id), Number(approveStatus), Number(locality_id));
        if (updatedDeliveryAddress) {
            if (Number(approveStatus) === 0 || Number(approveStatus) === 1) {
                res.status(200).json({
                    statusCode: 200,
                    message: `Delivery address updated successfully with approveStatus ${approveStatus}`,
                    data: null,
                });
            }
            else {
                res.status(200).json({
                    statusCode: 200,
                    message: "Delivery address updated successfully",
                });
            }
        }
        else {
            res.status(404).json({
                statusCode: 404,
                message: "Delivery address not found",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Error updating delivery address",
            error: error.message,
        });
    }
};
exports.updateDeliveryAddress = updateDeliveryAddress;
const deleteDeliveryAddress = async (req, res) => {
    const { id } = req.params;
    try {
        const isDeleted = await (0, deliveryAddressesModel_1.deleteDeliveryAddressById)(parseInt(id, 10));
        if (isDeleted) {
            res.status(200).json({
                statusCode: 200,
                message: "Delivery address deleted successfully",
            });
        }
        else {
            res.status(404).json({
                statusCode: 404,
                message: "Delivery address not found",
            });
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: "Error deleting delivery address",
            error: error.message,
        });
    }
};
exports.deleteDeliveryAddress = deleteDeliveryAddress;
