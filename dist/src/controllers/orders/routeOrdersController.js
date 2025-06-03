"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteOrders = void 0;
const routeOrdersModel_1 = require("../../models/orders/routeOrdersModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getRouteOrders = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const routeName = req.query.routeName || "All Routes";
    const foodName = req.query.foodName || "All Products";
    const searchTerm = req.query.searchTerm || "";
    try {
        const orders = await (0, routeOrdersModel_1.getAllRouteOrders)(page, limit, startDate, endDate, routeName, foodName, searchTerm);
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Orders fetched successfully", orders));
    }
    catch (error) {
        console.error("Error in controller:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching orders", error));
    }
};
exports.getRouteOrders = getRouteOrders;
