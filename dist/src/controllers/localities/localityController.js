"use strict";
// controllers/locality/localityController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocality = exports.updateLocality = exports.getLocality = exports.addLocality = exports.getLocalities = void 0;
const localityModel_1 = require("../../models/localities/localityModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all localities
const getLocalities = async (req, res) => {
    try {
        const localities = await (0, localityModel_1.getAllLocalities)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Localities fetched successfully", localities));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching localities", error));
    }
};
exports.getLocalities = getLocalities;
// Add a new locality
const addLocality = async (req, res) => {
    const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
    try {
        await (0, localityModel_1.createLocality)(route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Locality created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating locality", error));
    }
};
exports.addLocality = addLocality;
// Get locality by ID
const getLocality = async (req, res) => {
    const { id } = req.params;
    try {
        const locality = await (0, localityModel_1.getLocalityById)(parseInt(id));
        if (locality.length === 0) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Locality not found"));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "Locality fetched successfully", locality));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching locality", error));
    }
};
exports.getLocality = getLocality;
// Update locality by ID
const updateLocality = async (req, res) => {
    const { id } = req.params;
    const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
    try {
        await (0, localityModel_1.updateLocalityById)(parseInt(id), route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Locality updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating locality", error));
    }
};
exports.updateLocality = updateLocality;
// Delete locality by ID
const deleteLocality = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, localityModel_1.deleteLocalityById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Locality deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting locality", error));
    }
};
exports.deleteLocality = deleteLocality;
