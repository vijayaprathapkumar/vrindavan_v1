"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPlaceOrderById = exports.removePlaceOrder = exports.updatePlaceOrderController = exports.addPlaceOrderController = exports.fetchPlaceOrders = void 0;
const placeOrderModels_1 = require("../../models/placeOrder/placeOrderModels");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all place orders for a user
const fetchPlaceOrders = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm ? req.query.searchTerm : null;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
    try {
        const { total, placeOrders } = await (0, placeOrderModels_1.getAllPlaceOrders)(userId, page, limit, startDate, endDate, searchTerm);
        const totalPages = Math.ceil(total / limit);
        return res.json((0, responseHandler_1.createResponse)(200, "Place orders fetched successfully.", {
            placeOrders,
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total,
        }));
    }
    catch (error) {
        console.error("Error fetching place orders:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch place orders."));
    }
};
exports.fetchPlaceOrders = fetchPlaceOrders;
// Add a place order and clear the cart
const addPlaceOrderController = async (req, res) => {
    const { userId } = req.body;
    try {
        const cartItems = await (0, placeOrderModels_1.getCartItemsByUserId)(userId);
        if (!cartItems.length) {
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "No items in cart."));
        }
        const totalPrice = cartItems.reduce((total, item) => {
            const itemPrice = item.food.discountPrice || item.food.price;
            return total + itemPrice * item.quantity;
        }, 0);
        const status = "active";
        const method = "wallet";
        const orderResult = await (0, placeOrderModels_1.addPlaceOrder)({ price: totalPrice, userId, status, method });
        if (orderResult.affectedRows > 0) {
            await (0, placeOrderModels_1.deleteAllCartItemsByUserId)(userId);
            return res.status(201).json((0, responseHandler_1.createResponse)(201, "Place order added successfully, cart cleared, and wallet updated.", null));
        }
        else {
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "Failed to add place order."));
        }
    }
    catch (error) {
        console.error("Error adding place order:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to add place order."));
    }
};
exports.addPlaceOrderController = addPlaceOrderController;
// Update a place order
const updatePlaceOrderController = async (req, res) => {
    const { id } = req.params;
    const { price, description } = req.body;
    const status = "active";
    const method = "wallet";
    try {
        await (0, placeOrderModels_1.updatePlaceOrder)(Number(id), { price, description, status, method });
        return res.json((0, responseHandler_1.createResponse)(200, "Place order updated successfully.", null));
    }
    catch (error) {
        console.error("Error updating place order:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to update place order."));
    }
};
exports.updatePlaceOrderController = updatePlaceOrderController;
// Delete a place order by ID
const removePlaceOrder = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, placeOrderModels_1.deletePlaceOrderById)(Number(id));
        return res.json((0, responseHandler_1.createResponse)(200, "Place order deleted successfully.", null));
    }
    catch (error) {
        console.error("Error deleting place order:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to delete place order."));
    }
};
exports.removePlaceOrder = removePlaceOrder;
// Fetch a place order by ID
const fetchPlaceOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const placeOrder = await (0, placeOrderModels_1.getPlaceOrderById)(Number(id));
        if (!placeOrder) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Place order not found."));
        }
        const responce = { placeOrder: [placeOrder] };
        return res.json((0, responseHandler_1.createResponse)(200, "Place order fetched successfully.", responce));
    }
    catch (error) {
        console.error("Error fetching place order:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch place order."));
    }
};
exports.fetchPlaceOrderById = fetchPlaceOrderById;
