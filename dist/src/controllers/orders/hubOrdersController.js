"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHubOrders = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const hubOrdersModel_1 = require("../../models/orders/hubOrdersModel");
const getHubOrders = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const searchTerm = req.query.searchTerm || null;
        const routeNameFilter = req.query.routeName || null;
        const foodNameFilter = req.query.foodName || null;
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;
        const { totalRecords, orders } = await (0, hubOrdersModel_1.getAllHubOrders)(limit, offset, searchTerm, routeNameFilter, foodNameFilter, startDate, endDate);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Orders fetched successfully", {
            orders: orders,
            currentPage: page,
            limit: limit,
            totalRecords: totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching orders", error));
    }
};
exports.getHubOrders = getHubOrders;
