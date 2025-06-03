"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalityOrderSummary = exports.getLocalityOrders = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const localityOrderModel_1 = require("../../models/orderAdmin/localityOrderModel");
const getLocalityOrders = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const localityId = req.query.localityId ? Number(req.query.localityId) : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : null;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : null;
    const searchTerm = req.query.searchTerm || null;
    const productId = req.query.productId !== "All" ? Number(req.query.productId) : null;
    try {
        const { orders, total } = await (0, localityOrderModel_1.getLocalityOrdersAdmin)(page, limit, localityId, startDate, endDate, searchTerm, productId);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Locality orders fetched successfully", {
            localityOrders: orders,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching locality orders", {
            error: error.message,
        }));
    }
};
exports.getLocalityOrders = getLocalityOrders;
const getLocalityOrderSummary = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const localityId = req.query.localityId ? Number(req.query.localityId) : null;
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : null;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : null;
    const searchTerm = req.query.searchTerm || null;
    try {
        const { summaryData, total } = await (0, localityOrderModel_1.getLocalityOrderSummaryAdmin)(page, limit, localityId, startDate, endDate, searchTerm);
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Locality order summary fetched successfully", {
            summary: summaryData,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching locality order summary", {
            error: error.message,
        }));
    }
};
exports.getLocalityOrderSummary = getLocalityOrderSummary;
