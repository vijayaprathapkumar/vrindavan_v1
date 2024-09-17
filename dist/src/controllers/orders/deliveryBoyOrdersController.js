"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryBoyOrders = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const deliveryBoysOrdersModel_1 = require("../../models/orders/deliveryBoysOrdersModel");
const getDeliveryBoyOrders = async (req, res) => {
    try {
        const orders = await (0, deliveryBoysOrdersModel_1.getAllDeliveryBoyOrders)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Orders fetched successfully', orders));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching orders', error));
    }
};
exports.getDeliveryBoyOrders = getDeliveryBoyOrders;
