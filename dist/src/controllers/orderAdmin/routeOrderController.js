"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoodOrderSummaryController = exports.getFoodOrders = void 0;
const routeOrderModel_1 = require("../../models/orderAdmin/routeOrderModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getFoodOrders = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const routeId = req.query.routeId && req.query.routeId !== "All"
        ? Number(req.query.routeId)
        : null;
    const productId = req.query.productId && req.query.productId !== "All"
        ? Number(req.query.productId)
        : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : null;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : null;
    const searchTerm = req.query.searchTerm || null;
    try {
        const { foodOrders, total } = await (0, routeOrderModel_1.getAllFoodOrders)(page, limit, routeId, productId, startDate, endDate, searchTerm);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Food Orders fetched successfully", {
            foodOrders,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching food orders", {
            error: error.message || error,
        }));
    }
};
exports.getFoodOrders = getFoodOrders;
const getFoodOrderSummaryController = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const routeId = req.query.routeId && req.query.routeId !== "All"
        ? Number(req.query.routeId)
        : null;
    const productId = req.query.productId && req.query.productId !== "All"
        ? Number(req.query.productId)
        : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : null;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : null;
    const searchTerm = req.query.searchTerm || null;
    try {
        const { summaryData, total } = await (0, routeOrderModel_1.getFoodOrderSummary)(page, limit, routeId, productId, startDate, endDate, searchTerm);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Food Order Summary fetched successfully", {
            summary: summaryData,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching food order summary", {
            error: error.message || error,
        }));
    }
};
exports.getFoodOrderSummaryController = getFoodOrderSummaryController;
