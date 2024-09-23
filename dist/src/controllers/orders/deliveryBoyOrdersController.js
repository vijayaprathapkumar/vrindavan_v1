"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryBoyOrders = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const deliveryBoysOrdersModel_1 = require("../../models/orders/deliveryBoysOrdersModel");
const getDeliveryBoyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.searchTerm || '';
        const localityId = req.query.localityId ? parseInt(req.query.localityId) : null;
        const foodName = req.query.foodName || null;
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;
        const { data, totalRecords } = await (0, deliveryBoysOrdersModel_1.getAllDeliveryBoyOrders)(page, limit, searchTerm, localityId, foodName, startDate, endDate);
        const totalPages = Math.ceil(totalRecords / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Orders fetched successfully', {
            orders: data,
            pagination: {
                totalRecords,
                page,
                limit,
                currentPage: page,
                totalPages
            }
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching orders', error));
    }
};
exports.getDeliveryBoyOrders = getDeliveryBoyOrders;
