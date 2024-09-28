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

    res.status(200).json(createResponse(200, 'Localities fetched successfully', {
      localities,
      totalRecords,
      totalPages,
      currentPage: page,
      limit,
    }));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error fetching localities', error));
  }
};


// Add a new locality
export const addLocality = async (req: Request, res: Response): Promise<void> => {
  const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
  try {
    await createLocality(route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
    res.status(201).json(createResponse(201, 'Locality created successfully'));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error creating locality', error));
  }
};

// Get locality by ID
export const getLocality = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const locality = await getLocalityById(parseInt(id));
    if (locality.length === 0) {
      res.status(404).json(createResponse(404, 'Locality not found'));
    } else {
      res.status(200).json(createResponse(200, 'Locality fetched successfully', locality));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error fetching locality', error));
  }
};

// Update locality by ID
export const updateLocality = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { route_id, hub_id, name, address, google_address, latitude, longitude, city, active } = req.body;
  try {
    await updateLocalityById(parseInt(id), route_id, hub_id, name, address, google_address, latitude, longitude, city, active);
    res.status(200).json(createResponse(200, 'Locality updated successfully'));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error updating locality', error));
  }
};

// Delete locality by ID
export const deleteLocality = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteLocalityById(parseInt(id));
    res.status(200).json(createResponse(200, 'Locality deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(500, 'Error deleting locality', error));
  }
};
