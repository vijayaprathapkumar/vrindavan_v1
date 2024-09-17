"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrder = exports.getOrders = void 0;
const routeOrdersModel_1 = require("../../models/orders/routeOrdersModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Get all orders
const getOrders = async (req, res) => {
    try {
        const orders = await (0, routeOrdersModel_1.getAllOrders)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Orders fetched successfully', orders));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching orders', error));
    }
};
exports.getOrders = getOrders;
// Get a single order by ID
const getOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await (0, routeOrdersModel_1.getOrderById)(parseInt(id));
        if (!order) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, 'Order not found'));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, 'Order fetched successfully', order));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching order', error));
    }
};
exports.getOrder = getOrder;
// Create a new order
const createOrder = async (req, res) => {
    try {
        const newOrder = await (0, routeOrdersModel_1.createOrderInDb)(req.body);
        res.status(201).json((0, responseHandler_1.createResponse)(201, 'Order created successfully', newOrder));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error creating order', error));
    }
};
exports.createOrder = createOrder;
// Update an existing order
const updateOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedOrder = await (0, routeOrdersModel_1.updateOrderInDb)(parseInt(id), req.body);
        if (updatedOrder.affectedRows === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, 'Order not found'));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, 'Order updated successfully', updatedOrder));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error updating order', error));
    }
};
exports.updateOrder = updateOrder;
// Delete an order by ID
const deleteOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await (0, routeOrdersModel_1.deleteOrderInDb)(parseInt(id));
        if (result.affectedRows === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, 'Order not found'));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, 'Order deleted successfully'));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error deleting order', error));
    }
};
exports.deleteOrder = deleteOrder;
