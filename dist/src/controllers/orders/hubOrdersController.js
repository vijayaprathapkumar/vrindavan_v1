"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHubOrders = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const hubOrdersModel_1 = require("../../models/orders/hubOrdersModel");
const getHubOrders = async (req, res) => {
    try {
        const orders = await (0, hubOrdersModel_1.getAllHubOrders)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Orders fetched successfully', orders));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching orders', error));
    }
};
exports.getHubOrders = getHubOrders;
