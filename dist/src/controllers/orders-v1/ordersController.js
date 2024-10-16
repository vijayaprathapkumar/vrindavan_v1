"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOrderById = exports.removeOrder = exports.updateOrderController = exports.fetchOrders = void 0;
const ordersModel_1 = require("../../models/orders-v1/ordersModel");
const responseHandler_1 = require("../../utils/responseHandler");
const fetchOrders = async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
    if (isNaN(userId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "User ID is required and must be a number."));
    }
    try {
        const { total, orders } = await (0, ordersModel_1.getAllOrders)(userId, page, limit, startDate, endDate);
        res.json((0, responseHandler_1.createResponse)(200, "Orders fetched successfully.", {
            orders,
            totalRecords: total,
            page,
            limit,
        }));
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch orders."));
    }
};
exports.fetchOrders = fetchOrders;
// Update an order
const updateOrderController = async (req, res) => {
    const { id } = req.params;
    const orderData = req.body;
    try {
        await (0, ordersModel_1.updateOrder)(Number(id), orderData);
        res.json((0, responseHandler_1.createResponse)(200, "Order updated successfully."));
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update order."));
    }
};
exports.updateOrderController = updateOrderController;
// Delete an order by ID
const removeOrder = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, ordersModel_1.deleteOrderById)(Number(id));
        res.json((0, responseHandler_1.createResponse)(200, "Order deleted successfully."));
    }
    catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to delete order."));
    }
};
exports.removeOrder = removeOrder;
// Fetch an order by ID
const fetchOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await (0, ordersModel_1.getOrderById)(Number(id));
        if (!order) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Order not found."));
        }
        res.json((0, responseHandler_1.createResponse)(200, "Order fetched successfully.", order));
    }
    catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch order."));
    }
};
exports.fetchOrderById = fetchOrderById;
