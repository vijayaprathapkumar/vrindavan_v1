"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDeliveryBoyOrderSummary = exports.fetchDeliveryBoyOrders = void 0;
const deliveryBoyOrdersModel_1 = require("../../models/orderAdmin/deliveryBoyOrdersModel");
const responseHandler_1 = require("../../utils/responseHandler");
const fetchDeliveryBoyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const deliveryBoyId = req.query.deliveryBoyId
            ? parseInt(req.query.deliveryBoyId)
            : null;
        const productId = req.query.productId !== "All" ? Number(req.query.productId) : null;
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : null;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : null;
        const searchTerm = req.query.searchTerm
            ? req.query.searchTerm
            : null;
        const { orders, total } = await (0, deliveryBoyOrdersModel_1.getDeliveryBoyOrders)(page, limit, deliveryBoyId, startDate, endDate, searchTerm, productId);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Delivery boy orders fetched successfully", {
            deliveryOrders: orders,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error("Error fetching delivery boy orders:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Internal server error", null));
    }
};
exports.fetchDeliveryBoyOrders = fetchDeliveryBoyOrders;
const fetchDeliveryBoyOrderSummary = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const deliveryBoyId = req.query.deliveryBoyId
            ? parseInt(req.query.deliveryBoyId)
            : null;
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : null;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : null;
        const searchTerm = req.query.searchTerm
            ? req.query.searchTerm
            : null;
        const productId = req.query.productId !== "All" ? Number(req.query.productId) : null;
        const { summary, total } = await (0, deliveryBoyOrdersModel_1.getDeliveryBoyOrderSummary)(page, limit, deliveryBoyId, startDate, endDate, searchTerm, productId);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Delivery boy order summary fetched successfully", {
            summary,
            totalCount: total,
            currentPage: page,
            limit,
            totalPages: Math.ceil(total / limit),
        }));
    }
    catch (error) {
        console.error("Error fetching delivery boy order summary:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Internal server error", null));
    }
};
exports.fetchDeliveryBoyOrderSummary = fetchDeliveryBoyOrderSummary;
