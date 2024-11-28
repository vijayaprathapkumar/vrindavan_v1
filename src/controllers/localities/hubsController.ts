import { Request, Response } from 'express';
import {
    getAllHubs,
    createHub,
    getHubById,
    updateHubById,
    deleteHubById
} from '../../models/localities/hubsModel';
import { createResponse } from '../../utils/responseHandler';

// Fetch all hubs
export const getHubs = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || '');

    try {
        const { hubs, totalRecords } = await getAllHubs(page, limit, searchTerm);
        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            statusCode: 200,
            message: "Hubs fetched successfully",
            data: {
                hubs: hubs.map(hub => ({                    
                    id: hub.id,
                    route_id: hub.route_id,
                    name: hub.name,
                    other_details: hub.other_details,
                    active: hub.active,
                    created_at: hub.created_at,
                    updated_at: hub.updated_at,
                truckRoute:{
                    id: hub.truckRoute_id,
                    name: hub.truck_route_name,
                    active: hub.truck_route_active,
                    created_at: hub.truck_route_created_at,
                    updated_at: hub.truck_route_updated_at
                }
                })), 
                totalCount: totalRecords,
                currentPage: page,
                limit,
                totalPage: totalPages
            }
        });
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching hubs', error.message));
    }
};

// Add a new hub
export const addHub = async (req: Request, res: Response): Promise<void> => {
    const { route_id, name, other_details, active } = req.body;
    try {
        await createHub(route_id, name, other_details, active);
        res.status(201).json({
            statusCode: 201,
            message: 'Hub created successfully',
            data: {
                hub: null
            }
        });
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating hub', error.message));
    }
};

// Get hub by ID
export const getHub = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const hub = await getHubById(parseInt(id));
        if (!hub.length) {
            res.status(404).json(createResponse(404, 'Hub not found'));
        } else {
            res.status(200).json({
                statusCode: 200,
                message: "Hub fetched successfully",
                data: {
                    hub: [{
                        id: hub[0].id,
                        route_id: hub[0].route_id,
                        name: hub[0].name,
                        other_details: hub[0].other_details,
                        active: hub[0].active,
                        created_at: hub[0].created_at,
                        updated_at: hub[0].updated_at
                    }],
                }
            });
        }
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching hub', error.message));
    }
};

// Update hub by ID
export const updateHub = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { route_id, name, other_details, active } = req.body;
    try {
        await updateHubById(parseInt(id), route_id, name, other_details, active);
        res.status(200).json({
            statusCode: 200,
            message: 'Hub updated successfully',
            data: {
                hub: {
                    updateHub_id: parseInt(id)
                }
            }
        });
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error updating hub', error.message));
    }
};

// Delete hub by ID
export const deleteHub = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await deleteHubById(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: 'Hub deleted successfully',
            data: {
                hub: {
                    deleteHub_id: parseInt(id)
                }
            }
        });
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error deleting hub', error.message));
    }
};
