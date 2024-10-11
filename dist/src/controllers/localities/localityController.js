"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocality = exports.updateLocality = exports.getLocality = exports.addLocality = exports.getLocalities = void 0;
const localityModel_1 = require("../../models/localities/localityModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all localities
const getLocalities = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || '');
    try {
        const { localities, totalRecords } = await (0, localityModel_1.getAllLocalities)(page, limit, searchTerm);
        const totalPages = Math.ceil(totalRecords / limit);
        res.status(200).json({
            statusCode: 200,
            message: "Localities fetched successfully",
            data: {
                localities: localities.map(locality => ({
                    id: locality.id,
                    route_id: locality.route_id,
                    hub_id: locality.hub_id,
                    name: locality.name,
                    address: locality.address,
                    google_address: locality.google_address,
                    latitude: locality.latitude,
                    longitude: locality.longitude,
                    city: locality.city,
                    active: locality.active,
                    created_at: locality.created_at,
                    updated_at: locality.updated_at,
                })),
                totalCount: totalRecords,
                currentPage: page,
                limit,
                totalPage: totalPages,
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching localities', error.message));
    }
};
exports.getLocalities = getLocalities;
// Add a new locality
const addLocality = async (req, res) => {
    const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
    try {
        await (0, localityModel_1.createLocality)(route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
        res.status(201).json({
            statusCode: 201,
            message: 'Locality created successfully',
            data: {
                locality: null
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error creating locality', error.message));
    }
};
exports.addLocality = addLocality;
// Get locality by ID
const getLocality = async (req, res) => {
    const { id } = req.params;
    try {
        const locality = await (0, localityModel_1.getLocalityById)(parseInt(id));
        if (!locality.length) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, 'Locality not found'));
        }
        else {
            res.status(200).json({
                statusCode: 200,
                message: "Locality fetched successfully",
                data: {
                    locality: [{
                            id: locality[0].id,
                            route_id: locality[0].route_id,
                            hub_id: locality[0].hub_id,
                            name: locality[0].name,
                            address: locality[0].address,
                            google_address: locality[0].google_address,
                            latitude: locality[0].latitude,
                            longitude: locality[0].longitude,
                            city: locality[0].city,
                            active: locality[0].active,
                            created_at: locality[0].created_at,
                            updated_at: locality[0].updated_at,
                        }],
                },
            });
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error fetching locality', error.message));
    }
};
exports.getLocality = getLocality;
// Update locality by ID
const updateLocality = async (req, res) => {
    const { id } = req.params;
    const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
    try {
        await (0, localityModel_1.updateLocalityById)(parseInt(id), route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
        res.status(200).json({
            statusCode: 200,
            message: 'Locality updated successfully',
            data: {
                update_locality_id: parseInt(id),
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error updating locality', error.message));
    }
};
exports.updateLocality = updateLocality;
// Delete locality by ID
const deleteLocality = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, localityModel_1.deleteLocalityById)(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: 'Locality deleted successfully',
            data: {
                deleted_locality_id: parseInt(id),
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, 'Error deleting locality', error.message));
    }
};
exports.deleteLocality = deleteLocality;
