"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeliveryBoy = exports.updateDeliveryBoy = exports.getDeliveryBoy = exports.addDeliveryBoy = exports.getDeliveryBoys = void 0;
const deliveryBoyModel_1 = require("../../models/deliveryBoy/deliveryBoyModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all delivery boys
const getDeliveryBoys = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10
        const page = parseInt(req.query.page) || 1; // Default page to 1
        const offset = (page - 1) * limit;
        const searchTerm = req.query.searchTerm ? req.query.searchTerm : '';
        // Fetch filtered delivery boys and total count
        const { deliveryBoys, totalCount } = await (0, deliveryBoyModel_1.getAllDeliveryBoys)(limit, offset, searchTerm);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Delivery boys fetched successfully", {
            deliveryBoys,
            totalCount,
            limit,
            page,
            totalPages: Math.ceil(totalCount / limit), // Calculate total pages
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching delivery boys", error));
    }
};
exports.getDeliveryBoys = getDeliveryBoys;
// Add a new delivery boy
const addDeliveryBoy = async (req, res) => {
    const { userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup } = req.body;
    try {
        await (0, deliveryBoyModel_1.createDeliveryBoy)(userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Delivery boy created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating delivery boy", error));
    }
};
exports.addDeliveryBoy = addDeliveryBoy;
// Get delivery boy by ID
const getDeliveryBoy = async (req, res) => {
    const { id } = req.params;
    try {
        const deliveryBoy = await (0, deliveryBoyModel_1.getDeliveryBoyById)(parseInt(id));
        if (deliveryBoy.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Delivery boy not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Delivery boy fetched successfully", deliveryBoy));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching delivery boy", error));
    }
};
exports.getDeliveryBoy = getDeliveryBoy;
// Update delivery boy by ID
const updateDeliveryBoy = async (req, res) => {
    const { id } = req.params;
    const { userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup } = req.body;
    try {
        await (0, deliveryBoyModel_1.updateDeliveryBoyById)(parseInt(id), userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Delivery boy updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating delivery boy", error));
    }
};
exports.updateDeliveryBoy = updateDeliveryBoy;
// Delete delivery boy by ID
const deleteDeliveryBoy = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, deliveryBoyModel_1.deleteDeliveryBoyById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Delivery boy deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting delivery boy", error));
    }
};
exports.deleteDeliveryBoy = deleteDeliveryBoy;
