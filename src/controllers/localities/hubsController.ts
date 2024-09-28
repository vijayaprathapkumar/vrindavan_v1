import { Request, Response } from 'express';
import {
    getAllHubs,
    createHub,
    getHubById,
    updateHubById,
    deleteHubById
} from '../../models/localities/hubsModel';
import { createResponse } from '../../utils/responseHandler';


export const getHubs = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || '');

    try {
        const { hubs, totalRecords } = await getAllHubs(page, limit, searchTerm);
        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json(createResponse(200, 'Hubs fetched successfully', {
            hubs,
            totalRecords,
            totalPages,
            currentPage: page,
            limit,
        }));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching hubs', error));
    }
};

// Add a new hub
export const addHub = async (req: Request, res: Response): Promise<void> => {
    const { route_id, name, other_details, active } = req.body;
    try {
        await createHub(route_id, name, other_details, active);
        res.status(201).json(createResponse(201, 'Hub created successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating hub', error));
    }
};

// Get hub by ID
export const getHub = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const hub = await getHubById(parseInt(id));
        if (hub.length === 0) {
            res.status(404).json(createResponse(404, 'Hub not found'));
        } else {
            res.status(200).json(createResponse(200, 'Hub fetched successfully', hub));
        }
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching hub', error));
    }
};

// Update hub by ID
export const updateHub = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { route_id, name, other_details, active } = req.body;
    try {
        await updateHubById(parseInt(id), route_id, name, other_details, active);
        res.status(200).json(createResponse(200, 'Hub updated successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error updating hub', error));
    }
};

// Delete hub by ID
export const deleteHub = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await deleteHubById(parseInt(id));
        res.status(200).json(createResponse(200, 'Hub deleted successfully'));
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error deleting hub', error));
    }
};
