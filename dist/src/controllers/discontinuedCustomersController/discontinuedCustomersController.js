"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDiscontinuedCustomers = void 0;
const discontinuedCustomersModel_1 = require("../../models/discontinuedCustomersModel/discontinuedCustomersModel");
const responseHandler_1 = require("../../utils/responseHandler");
const fetchDiscontinuedCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'name';
        const sortOrder = req.query.sortOrder || "";
        const searchTerm = req.query.searchTerm || '';
        const offset = (page - 1) * limit;
        const discontinuedCustomers = await (0, discontinuedCustomersModel_1.getDiscontinuedCustomers)(limit, offset, sortField, sortOrder, searchTerm);
        if (discontinuedCustomers.length === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "No discontinued customers found."));
        }
        const totalCount = await (0, discontinuedCustomersModel_1.getDiscontinuedCustomersCount)();
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Discontinued customers fetched successfully", {
            discontinuedCustomers,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        console.error("Error fetching discontinued customers:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch discontinued customers."));
    }
};
exports.fetchDiscontinuedCustomers = fetchDiscontinuedCustomers;
