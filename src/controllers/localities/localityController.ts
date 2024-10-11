import { Request, Response } from 'express';
import {
    getAllLocalities,
    createLocality,
    getLocalityById,
    updateLocalityById,
    deleteLocalityById,
} from '../../models/localities/localityModel';
import { createResponse } from '../../utils/responseHandler';

// Fetch all localities
export const getLocalities = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || '');

    try {
        const { localities, totalRecords } = await getAllLocalities(page, limit, searchTerm);
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
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching localities', error.message));
    }
};

// Add a new locality
export const addLocality = async (req: Request, res: Response): Promise<void> => {
    const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
    try {
        await createLocality(route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
        res.status(201).json({
            statusCode: 201,
            message: 'Locality created successfully',
            data: {
                locality: null
            },
        });
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error creating locality', error.message));
    }
};

// Get locality by ID
export const getLocality = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const locality = await getLocalityById(parseInt(id));
        if (!locality.length) {
            res.status(404).json(createResponse(404, 'Locality not found'));
        } else {
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
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error fetching locality', error.message));
    }
};

// Update locality by ID
export const updateLocality = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
    try {
        await updateLocalityById(parseInt(id), route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
        res.status(200).json({
            statusCode: 200,
            message: 'Locality updated successfully',
            data: {
          
              update_locality_id: parseInt(id),
                  
              
            },
        });
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error updating locality', error.message));
    }
};

// Delete locality by ID
export const deleteLocality = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await deleteLocalityById(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: 'Locality deleted successfully',
            data: {
                deleted_locality_id: parseInt(id),
            },
        });
    } catch (error) {
        res.status(500).json(createResponse(500, 'Error deleting locality', error.message));
    }
};
