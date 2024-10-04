"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePlaceOrder = exports.updatePlaceOrderController = exports.addPlaceOrderController = exports.fetchPlaceOrders = void 0;
const placeOrderModels_1 = require("../../models/placeOrder/placeOrderModels");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all place orders for a user
const fetchPlaceOrders = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { total, placeOrders } = await (0, placeOrderModels_1.getAllPlaceOrders)(userId, page, limit);
        res.json((0, responseHandler_1.createResponse)(200, "Place orders fetched successfully.", {
            placeOrders,
            totalRecords: total,
            page,
            limit,
        }));
    }
    catch (error) {
        console.error("Error fetching place orders:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch place orders."));
    }
};
exports.fetchPlaceOrders = fetchPlaceOrders;
const addPlaceOrderController = async (req, res) => {
    const { userId } = req.body;
    try {
        const price = await (0, placeOrderModels_1.getPriceForNextOrder)(userId);
        if (!price) {
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "Price not found for the user."));
        }
        const status = "active";
        const method = "wallet";
        const result = await (0, placeOrderModels_1.addPlaceOrder)({
            price,
            userId,
            status,
            method,
        });
        if (result.affectedRows > 0) {
            res.status(201).json((0, responseHandler_1.createResponse)(201, "Place order added successfully and wallet updated."));
        }
        else {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Failed to add place order."));
        }
    }
    catch (error) {
        console.error("Error adding place order:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to add place order."));
    }
};
exports.addPlaceOrderController = addPlaceOrderController;
// Update a place order and wallet balance
const updatePlaceOrderController = async (req, res) => {
    const { id } = req.params;
    const { price, description } = req.body;
    const status = "active";
    const method = "wallet";
    try {
        await (0, placeOrderModels_1.updatePlaceOrder)(Number(id), { price, description, status, method });
        res.json((0, responseHandler_1.createResponse)(200, "Place order updated and wallet balance adjusted."));
    }
    catch (error) {
        console.error("Error updating place order:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update place order."));
    }
};
exports.updatePlaceOrderController = updatePlaceOrderController;
// Delete a place order by ID
const removePlaceOrder = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, placeOrderModels_1.deletePlaceOrderById)(Number(id));
        res.json((0, responseHandler_1.createResponse)(200, "Place order deleted successfully."));
    }
    catch (error) {
        console.error("Error deleting place order:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to delete place order."));
    }
};
exports.removePlaceOrder = removePlaceOrder;
