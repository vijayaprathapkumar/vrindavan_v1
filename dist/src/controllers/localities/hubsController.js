"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHub = exports.updateHub = exports.getHub = exports.addHub = exports.getHubs = void 0;
const hubsModel_1 = require("../../models/localities/hubsModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getHubs = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || '');
    try {
        const { hubs, totalRecords } = await (0, hubsModel_1.getAllHubs)(page, limit, searchTerm);
        const totalPages = Math.ceil(totalRecords / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Hubs fetched successfully', {
            hubs,
            totalRecords,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching hubs', error));
    }
};
exports.getHubs = getHubs;
// Add a new hub
const addHub = async (req, res) => {
    const { route_id, name, other_details, active } = req.body;
    try {
        await (0, hubsModel_1.createHub)(route_id, name, other_details, active);
        res.status(201).json((0, responseHandler_1.createResponse)(201, 'Hub created successfully'));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error creating hub', error));
    }
};
exports.addHub = addHub;
// Get hub by ID
const getHub = async (req, res) => {
    const { id } = req.params;
    try {
        const hub = await (0, hubsModel_1.getHubById)(parseInt(id));
        if (hub.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, 'Hub not found'));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, 'Hub fetched successfully', hub));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching hub', error));
    }
};
exports.getHub = getHub;
// Update hub by ID
const updateHub = async (req, res) => {
    const { id } = req.params;
    const { route_id, name, other_details, active } = req.body;
    try {
        await (0, hubsModel_1.updateHubById)(parseInt(id), route_id, name, other_details, active);
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Hub updated successfully'));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error updating hub', error));
    }
};
exports.updateHub = updateHub;
// Delete hub by ID
const deleteHub = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, hubsModel_1.deleteHubById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, 'Hub deleted successfully'));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error deleting hub', error));
    }
};
exports.deleteHub = deleteHub;
