"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHub = exports.updateHub = exports.getHub = exports.addHub = exports.getHubs = void 0;
const hubsModel_1 = require("../../models/localities/hubsModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all hubs
const getHubs = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || "");
    const sortField = String(req.query.sortField || "");
    const sortOrder = String(req.query.sortOrder || "");
    try {
        const { hubs, totalRecords } = await (0, hubsModel_1.getAllHubs)(page, limit, searchTerm, sortField, sortOrder);
        const totalPages = Math.ceil(totalRecords / limit);
        res.status(200).json({
            statusCode: 200,
            message: "Hubs fetched successfully",
            data: {
                hubs: hubs.map((hub) => ({
                    id: hub.id,
                    route_id: hub.route_id,
                    name: hub.name,
                    other_details: hub.other_details,
                    active: hub.active,
                    created_at: hub.created_at,
                    updated_at: hub.updated_at,
                    truckRoute: {
                        id: hub.truckRoute_id,
                        name: hub.truck_route_name,
                        active: hub.truck_route_active,
                        created_at: hub.truck_route_created_at,
                        updated_at: hub.truck_route_updated_at,
                    },
                })),
                totalCount: totalRecords,
                currentPage: page,
                limit,
                totalPage: totalPages,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching hubs", error.message));
    }
};
exports.getHubs = getHubs;
// Add a new hub
const addHub = async (req, res) => {
    const { route_id, name, other_details, active } = req.body;
    try {
        await (0, hubsModel_1.createHub)(route_id, name, other_details, active);
        res.status(201).json({
            statusCode: 201,
            message: "Hub created successfully",
            data: {
                hub: null,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating hub", error.message));
    }
};
exports.addHub = addHub;
// Get hub by ID
const getHub = async (req, res) => {
    const { id } = req.params;
    try {
        const hub = await (0, hubsModel_1.getHubById)(parseInt(id));
        if (!hub.length) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Hub not found"));
        }
        else {
            res.status(200).json({
                statusCode: 200,
                message: "Hub fetched successfully",
                data: {
                    hub: [
                        {
                            id: hub[0].id,
                            route_id: hub[0].route_id,
                            name: hub[0].name,
                            other_details: hub[0].other_details,
                            active: hub[0].active,
                            created_at: hub[0].created_at,
                            updated_at: hub[0].updated_at,
                        },
                    ],
                },
            });
        }
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching hub", error.message));
    }
};
exports.getHub = getHub;
// Update hub by ID
const updateHub = async (req, res) => {
    const { id } = req.params;
    const { route_id, name, other_details, active } = req.body;
    try {
        await (0, hubsModel_1.updateHubById)(parseInt(id), route_id, name, other_details, active);
        res.status(200).json({
            statusCode: 200,
            message: "Hub updated successfully",
            data: {
                hub: {
                    updateHub_id: parseInt(id),
                },
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating hub", error.message));
    }
};
exports.updateHub = updateHub;
// Delete hub by ID
const deleteHub = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, hubsModel_1.deleteHubById)(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: "Hub deleted successfully",
            data: {
                hub: {
                    deleteHub_id: parseInt(id),
                },
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting hub", error.message));
    }
};
exports.deleteHub = deleteHub;
