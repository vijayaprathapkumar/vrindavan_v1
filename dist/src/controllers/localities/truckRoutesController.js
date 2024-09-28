"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTruckRoute = exports.updateTruckRoute = exports.getTruckRoute = exports.addTruckRoute = exports.getTruckRoutes = void 0;
const truckRoutesModel_1 = require("../../models/localities/truckRoutesModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all truck routes
const getTruckRoutes = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || '');
    try {
        const { routes, totalRecords } = await (0, truckRoutesModel_1.getAllTruckRoutes)(page, limit, searchTerm);
        const totalPages = Math.ceil(totalRecords / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Truck routes fetched successfully", {
            routes,
            totalRecords,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching truck routes", error));
    }
};
exports.getTruckRoutes = getTruckRoutes;
// Add a new truck route
const addTruckRoute = async (req, res) => {
    const { name, active } = req.body;
    try {
        // Convert status to numeric values if needed
        const activeValue = active === "Active" ? 1 : 0;
        await (0, truckRoutesModel_1.createTruckRoute)(name, activeValue);
        res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Truck route created successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating truck route", error));
    }
};
exports.addTruckRoute = addTruckRoute;
// Get truck route by ID
const getTruckRoute = async (req, res) => {
    const { id } = req.params;
    try {
        const truckRoute = await (0, truckRoutesModel_1.getTruckRouteById)(parseInt(id));
        if (truckRoute.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Truck route not found"));
        }
        else {
            res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Truck route fetched successfully", truckRoute[0]));
        }
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching truck route", error));
    }
};
exports.getTruckRoute = getTruckRoute;
// Update truck route by ID
const updateTruckRoute = async (req, res) => {
    const { id } = req.params;
    const { name, active } = req.body;
    try {
        await (0, truckRoutesModel_1.updateTruckRouteById)(parseInt(id), name, parseInt(active, 10));
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Truck route updated successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating truck route", error));
    }
};
exports.updateTruckRoute = updateTruckRoute;
// Delete truck route by ID
const deleteTruckRoute = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, truckRoutesModel_1.deleteTruckRouteById)(parseInt(id));
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Truck route deleted successfully"));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting truck route", error));
    }
};
exports.deleteTruckRoute = deleteTruckRoute;
