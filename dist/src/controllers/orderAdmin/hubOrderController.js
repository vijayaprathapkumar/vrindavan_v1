"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByRoute = exports.getHubOrderSummaryController = exports.getHubOrders = void 0;
const hubOrderModel_1 = require("../../models/orderAdmin/hubOrderModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getHubOrders = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const routeId = req.query.route_id
        ? parseInt(req.query.route_id)
        : null;
    const hubId = req.query.hub_id ? parseInt(req.query.hub_id) : null;
    const productId = req.query.productId !== "All" ? Number(req.query.productId) : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : null;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : null;
    const searchTerm = req.query.searchTerm || null;
    try {
        const { hubOrders, total } = await (0, hubOrderModel_1.getAllHubOrders)(page, limit, routeId, productId, startDate, endDate, searchTerm, hubId);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Hub Orders fetched successfully", {
            hubOrders,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching hub orders", {
            error: error.message,
        }));
    }
};
exports.getHubOrders = getHubOrders;
const getHubOrderSummaryController = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const routeId = req.query.routeId !== "All" ? Number(req.query.routeId) : null;
    const productId = req.query.productId !== "All" ? Number(req.query.productId) : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : null;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : null;
    const searchTerm = req.query.searchTerm || null;
    try {
        const { summaryData, total } = await (0, hubOrderModel_1.getHubOrderSummary)(page, limit, routeId, productId, startDate, endDate, searchTerm);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Hub Order Summary fetched successfully", {
            summary: summaryData,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching hub order summary", {
            error: error.message,
        }));
    }
};
exports.getHubOrderSummaryController = getHubOrderSummaryController;
const getOrdersByRoute = async (req, res) => {
    const routeId = parseInt(req.params.routeId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (isNaN(routeId)) {
        res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid route ID"));
        return;
    }
    try {
        const { orders, total } = await (0, hubOrderModel_1.getOrdersGroupedByRoute)(routeId, page, limit);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Orders fetched successfully", {
            hubOrder: orders,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching orders", {
            error: error.message,
        }));
    }
};
exports.getOrdersByRoute = getOrdersByRoute;
