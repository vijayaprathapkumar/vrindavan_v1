"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTruckRoute = exports.updateTruckRoute = exports.getTruckRoute = exports.addTruckRoute = exports.getTruckRoutes = void 0;
const truckRoutesModel_1 = require("../../models/localities/truckRoutesModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all truck routes with pagination and filters
const getTruckRoutes = async (req, res) => {
    const { searchTerm = "", sortField = "", sortOrder = "", } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    try {
        const { routes, totalRecords } = await (0, truckRoutesModel_1.getAllTruckRoutes)(Number(page), limit, searchTerm.toString(), sortField.toString(), sortOrder.toString());
        const totalPages = Math.ceil(totalRecords / limit);
        res.status(200).json({
            statusCode: 200,
            message: "Truck routes fetched successfully",
            data: {
                truckRoutes: routes,
                totalCount: totalRecords,
                currentPage: Number(page),
                limit: limit,
                totalPage: totalPages,
            },
        });
    }
    catch (error) {
        console.error("Error fetching truck routes:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching truck routes", error.message));
    }
};
exports.getTruckRoutes = getTruckRoutes;
// Add a new truck route
const addTruckRoute = async (req, res) => {
    const { name, active } = req.body;
    try {
        await (0, truckRoutesModel_1.createTruckRoute)(name, active);
        res.status(201).json({
            statusCode: 201,
            message: "Truck route created successfully",
            data: {
                truckRoute: null,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating truck route", error.message));
    }
};
exports.addTruckRoute = addTruckRoute;
// Get truck route by ID
const getTruckRoute = async (req, res) => {
    const { id } = req.params;
    try {
        const truckRoute = await (0, truckRoutesModel_1.getTruckRouteById)(parseInt(id));
        if (!truckRoute) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Truck route not found"));
        }
        else {
            res.status(200).json({
                statusCode: 200,
                message: "Truck route fetched successfully",
                data: {
                    truckRoute: [
                        {
                            id: truckRoute.id,
                            name: truckRoute.name,
                            active: truckRoute.active,
                            created_at: truckRoute.created_at,
                            updated_at: truckRoute.updated_at,
                        },
                    ],
                },
            });
        }
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching truck route", error.message));
    }
};
exports.getTruckRoute = getTruckRoute;
// Update truck route by ID
const updateTruckRoute = async (req, res) => {
    const { id } = req.params;
    const { name, active } = req.body;
    try {
        await (0, truckRoutesModel_1.updateTruckRouteById)(parseInt(id), name, parseInt(active, 10));
        res.status(200).json({
            statusCode: 200,
            message: "Truck route updated successfully",
            data: {
                truckRoute: {
                    updateTruck_id: parseInt(id),
                },
            },
        });
    }
    catch (error) {
        res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Error updating truck route", error.message));
    }
};
exports.updateTruckRoute = updateTruckRoute;
// Delete truck route by ID
const deleteTruckRoute = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, truckRoutesModel_1.deleteTruckRouteById)(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: "Truck route deleted successfully",
            data: {
                truckRoute: {
                    deleteTruck_id: parseInt(id),
                },
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting truck route", error.message));
    }
};
exports.deleteTruckRoute = deleteTruckRoute;
