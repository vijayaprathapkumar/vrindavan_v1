"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarWiseOrders = exports.cancelOneTimeOrder = exports.getUpcomingOrders = exports.cancelSubscriptionOrder = exports.removeOrder = exports.updateOrderQty = exports.fetchOrderById = exports.fetchAllOrdersWithOutUserID = exports.fetchAllOrders = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const orderModel_1 = require("../../models/orders/orderModel");
const fetchAllOrders = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm
        ? req.query.searchTerm
        : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : undefined;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : undefined;
    // Input validation
    if (isNaN(page) || page < 1) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid page number."));
    }
    if (isNaN(limit) || limit < 1) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid limit number."));
    }
    try {
        const { total, placeOrders } = await (0, orderModel_1.getAllOrders)(userId, page, limit, startDate, endDate, searchTerm);
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
exports.fetchAllOrders = fetchAllOrders;
const fetchAllOrdersWithOutUserID = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const routeId = req.query.route_id
        ? parseInt(req.query.route_id)
        : null;
    const hubId = req.query.hub_id ? parseInt(req.query.hub_id) : null;
    const localityId = req.query.locality_id
        ? parseInt(req.query.locality_id)
        : null;
    const searchTerm = req.query.searchTerm
        ? req.query.searchTerm
        : null;
    const approveStatus = req.query.approveStatus
        ? req.query.approveStatus
        : "All";
    const orderType = req.query.orderType
        ? req.query.orderType
        : null;
    const deliveryBoyId = req.query.deliveryBoyId
        ? parseInt(req.query.deliveryBoyId)
        : null;
    const productId = req.query.productId
        ? parseInt(req.query.productId)
        : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : undefined;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : undefined;
    const walletFilter = req.query.walletOption
        ? req.query.walletOption
        : null;
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "asc";
    // Input validation
    if (isNaN(page) || page < 1) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid page number."));
    }
    if (isNaN(limit) || limit < 1) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid limit number."));
    }
    try {
        const { total, placeOrders } = await (0, orderModel_1.getAllOrdersWithOutUserId)(page, limit, startDate, endDate, searchTerm, routeId, hubId, localityId, productId, approveStatus, orderType, deliveryBoyId, walletFilter, sortField, sortOrder);
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Orders fetched successfully.", {
            placeOrders,
            currentPage: page,
            limit,
            totalPages,
            totalCount: total,
        }));
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "An error occurred while fetching orders."));
    }
};
exports.fetchAllOrdersWithOutUserID = fetchAllOrdersWithOutUserID;
const fetchOrderById = async (req, res) => {
    const id = parseInt(req.params.id);
    const searchTerm = req.query.searchTerm
        ? req.query.searchTerm
        : null;
    try {
        const placeOrder = await (0, orderModel_1.getPlaceOrderById)(Number(id), searchTerm);
        if (!placeOrder) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Place order not found."));
        }
        return res.json((0, responseHandler_1.createResponse)(200, "Place order fetched successfully.", { placeOrder }));
    }
    catch (error) {
        console.error("Error fetching place order:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch place order."));
    }
};
exports.fetchOrderById = fetchOrderById;
//update  Qnty Change
const updateOrderQty = async (req, res) => {
    const { orderId, quantity, orderDate, orderType, subscriptionId } = req.body;
    if (orderType === 2 && !subscriptionId) {
        return res.status(400).json({ message: "Subscription ID is required." });
    }
    try {
        if (orderType === 1) {
            await (0, orderModel_1.updateOneTimeOrders)(orderId, quantity);
        }
        else if (orderType === 2) {
            await (0, orderModel_1.updateSubscriptionOrders)(subscriptionId, quantity, orderDate);
        }
        else {
            return res.status(400).json({ message: "Invalid order type." });
        }
        return res.json({ message: "Order updated successfully." });
    }
    catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({ message: "Failed to update order." });
    }
};
exports.updateOrderQty = updateOrderQty;
// Delete a place order by ID
const removeOrder = async (req, res) => {
    const { id } = req.params;
    if (isNaN(Number(id)) || Number(id) <= 0) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid ID. It must be a positive number."));
    }
    try {
        await (0, orderModel_1.deletePlaceOrderById)(Number(id));
        return res.json((0, responseHandler_1.createResponse)(200, "Order deleted successfully.", null));
    }
    catch (error) {
        console.error("Error deleting place order:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to delete place order."));
    }
};
exports.removeOrder = removeOrder;
const cancelSubscriptionOrder = async (req, res) => {
    const { subscriptionId, cancelOrderDate, reason, otherReason } = req.body;
    if (!subscriptionId || !cancelOrderDate) {
        res
            .status(400)
            .json({ message: "Subscription ID and cancelOrderDate are required." });
        return;
    }
    try {
        const formattedDate = new Date(cancelOrderDate).toISOString().split("T")[0];
        await (0, orderModel_1.cancelOrder)(subscriptionId, formattedDate, reason, otherReason);
        res
            .status(200)
            .json({ message: "Subscription order canceled successfully." });
    }
    catch (error) {
        console.error("Error canceling subscription order:", error);
        res.status(500).json({
            message: "Failed to cancel subscription order.",
            error: error.message,
        });
    }
};
exports.cancelSubscriptionOrder = cancelSubscriptionOrder;
const getUpcomingOrders = async (req, res) => {
    const userId = parseInt(req.params.id);
    const dateParam = req.query.date || req.body.date; // Accepts date from query or body
    const currentDate = dateParam ? new Date(dateParam) : new Date(); // Use provided date or current date
    const { page = 1, limit = 10 } = req.query;
    const currentPage = parseInt(page, 10);
    const recordsPerPage = parseInt(limit, 10);
    // Validate userId and date
    if (isNaN(userId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid user ID."));
    }
    if (isNaN(currentDate.getTime())) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid date format."));
    }
    try {
        const allUpcomingOrders = await (0, orderModel_1.getUpcomingOrdersModel)(userId, currentDate);
        const totalRecord = allUpcomingOrders.length;
        const totalPages = Math.ceil(totalRecord / recordsPerPage);
        const upcomingOrders = allUpcomingOrders.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Upcoming orders fetched successfully.", {
            upcomingOrders,
            totalRecord,
            currentPage,
            limit: recordsPerPage,
            totalPages,
        }));
    }
    catch (error) {
        console.error("Error fetching upcoming orders:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch upcoming orders.", error.message));
    }
};
exports.getUpcomingOrders = getUpcomingOrders;
// cancel one time order
const cancelOneTimeOrder = async (req, res) => {
    const { orderId } = req.params;
    // Validate orderId
    if (!orderId || isNaN(parseInt(orderId))) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid order ID."));
    }
    try {
        const now = new Date();
        const nineThirtyPM = new Date();
        nineThirtyPM.setHours(21, 30, 0, 0); // Set time to 9:30 PM
        if (now > nineThirtyPM) {
            return res
                .status(403)
                .json((0, responseHandler_1.createResponse)(403, "You cannot cancel the order after 9:30 PM."));
        }
        const result = await (0, orderModel_1.cancelOneTimeOrderModel)(parseInt(orderId));
        if (result.success) {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "Order canceled successfully."));
        }
        else {
            res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Order not found or already canceled."));
        }
    }
    catch (error) {
        console.error("Error canceling order:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to cancel order.", error.message));
    }
};
exports.cancelOneTimeOrder = cancelOneTimeOrder;
const getCalendarWiseOrders = async (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    const { startDate, endDate } = req.query;
    // Validate userId and date parameters
    if (isNaN(userId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid user ID."));
    }
    if (!startDate || !endDate) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "startDate and endDate are required."));
    }
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid date format."));
    }
    try {
        const calendarData = await (0, orderModel_1.getCalendarWiseOrdersModel)(userId, parsedStartDate, parsedEndDate);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Calendar-wise orders fetched successfully.", {
            calendarData,
        }));
    }
    catch (error) {
        console.error("Error fetching calendar-wise orders:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch calendar-wise orders.", error.message));
    }
};
exports.getCalendarWiseOrders = getCalendarWiseOrders;
