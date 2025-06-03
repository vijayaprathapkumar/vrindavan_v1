"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocalitiesForDeliveryBoy = exports.deleteDeliveryBoy = exports.updateDeliveryBoy = exports.getDeliveryBoy = exports.addDeliveryBoy = exports.getDeliveryBoysWithLocalities = void 0;
const deliveryBoyModel_1 = require("../../models/deliveryBoy/deliveryBoyModel");
const responseHandler_1 = require("../../utils/responseHandler");
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all delivery boys
const getDeliveryBoysWithLocalities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const searchTerm = req.query.searchTerm
            ? req.query.searchTerm
            : "";
        const sortField = req.query.sortField
            ? req.query.sortField
            : "";
        const sortOrder = req.query.sortOrder
            ? req.query.sortOrder
            : "";
        const { deliveryBoys, totalCount } = await (0, deliveryBoyModel_1.getAllDeliveryBoysWithLocalities)(limit, page, searchTerm, sortField.toString(), sortOrder.toString());
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Delivery boys and localities fetched successfully", {
            deliveryBoys,
            totalCount,
            limit,
            currentPage: page,
            totalPages: totalPages,
        }));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching delivery boys and localities", error));
    }
};
exports.getDeliveryBoysWithLocalities = getDeliveryBoysWithLocalities;
const addDeliveryBoy = async (req, res) => {
    try {
        const data = req.body;
        await (0, deliveryBoyModel_1.createDeliveryBoy)(data);
        res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Delivery boy created successfully"));
    }
    catch (error) {
        console.error("Error creating delivery boy:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating delivery boy", error.message || error));
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
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching delivery boy", error));
    }
};
exports.getDeliveryBoy = getDeliveryBoy;
// Update delivery boy by ID
// Update delivery boy by ID
const updateDeliveryBoy = async (req, res) => {
    const { id } = req.params;
    const { userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup, localityIds, } = req.body;
    const connection = await databaseConnection_1.db.promise().getConnection();
    try {
        await connection.beginTransaction();
        // Update the delivery boy details
        await (0, deliveryBoyModel_1.updateDeliveryBoyById)(parseInt(id), userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup);
        if (localityIds && localityIds.length > 0) {
            // **Step 1: Remove locality assignments of this delivery boy**
            await connection.query(`DELETE FROM locality_delivery_boys WHERE delivery_boy_id = ?`, [id]);
            // **Step 2: Ensure that localityIds are not assigned to another delivery boy**
            await connection.query(`DELETE FROM locality_delivery_boys WHERE locality_id IN (?)`, [localityIds]);
            // **Step 3: Insert new assignments**
            const values = localityIds.map((localityId) => [
                id,
                localityId,
                new Date(),
                new Date(),
            ]);
            await connection.query(`INSERT INTO locality_delivery_boys (delivery_boy_id, locality_id, created_at, updated_at) 
         VALUES ?`, [values]);
        }
        await connection.commit();
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Delivery boy updated successfully"));
    }
    catch (error) {
        await connection.rollback();
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating delivery boy", error.message || error));
    }
    finally {
        connection.release();
    }
};
exports.updateDeliveryBoy = updateDeliveryBoy;
// Delete delivery boy by ID
const deleteDeliveryBoy = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, deliveryBoyModel_1.deleteDeliveryBoyById)(parseInt(id));
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Delivery boy deleted successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting delivery boy", error));
    }
};
exports.deleteDeliveryBoy = deleteDeliveryBoy;
const deleteLocalitiesForDeliveryBoy = async (req, res) => {
    const { id } = req.params;
    const parsedDeliveryBoyLocalityId = parseInt(id);
    // Validate deliveryBoyId
    if (isNaN(parsedDeliveryBoyLocalityId)) {
        res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid deliveryBoyId provided"));
        return;
    }
    // Normalize localityIds to an array
    if (!id) {
        res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "No locality IDs provided for deletion"));
        return;
    }
    try {
        await (0, deliveryBoyModel_1.deleteLocalitiesByDeliveryBoyId)(parsedDeliveryBoyLocalityId);
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Localities removed successfully"));
    }
    catch (error) {
        if (error.message === "No matching locality assignments found for deletion.") {
            res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Localities not found for deletion"));
        }
        else {
            res
                .status(500)
                .json((0, responseHandler_1.createResponse)(500, "Error removing localities", error));
        }
    }
};
exports.deleteLocalitiesForDeliveryBoy = deleteLocalitiesForDeliveryBoy;
