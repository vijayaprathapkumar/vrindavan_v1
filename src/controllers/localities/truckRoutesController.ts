import { Request, Response } from "express";
import {
  getAllTruckRoutes,
  createTruckRoute,
  getTruckRouteById,
  updateTruckRouteById,
  deleteTruckRouteById,
} from "../../models/localities/truckRoutesModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all truck routes
export const getTruckRoutes = async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const searchTerm = String(req.query.searchTerm || '');

  try {
      const { routes, totalRecords } = await getAllTruckRoutes(page, limit, searchTerm);
      const totalPages = Math.ceil(totalRecords / limit);

      res.status(200).json(createResponse(200, "Truck routes fetched successfully", {
          routes,
          totalRecords,
          totalPages,
          currentPage: page,
          limit,
      }));
  } catch (error) {
      res.status(500).json(createResponse(500, "Error fetching truck routes", error));
  }
};

// Add a new truck route
export const addTruckRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, active } = req.body;
  try {
    // Convert status to numeric values if needed
    const activeValue = active === "Active" ? 1 : 0;
    await createTruckRoute(name, activeValue);
    res
      .status(201)
      .json(createResponse(201, "Truck route created successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error creating truck route", error));
  }
};

// Get truck route by ID
export const getTruckRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const truckRoute = await getTruckRouteById(parseInt(id));
    if (truckRoute.length === 0) {
      res.status(404).json(createResponse(404, "Truck route not found"));
    } else {
      res
        .status(200)
        .json(
          createResponse(200, "Truck route fetched successfully", truckRoute[0])
        );
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching truck route", error));
  }
};

// Update truck route by ID
export const updateTruckRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, active } = req.body;
  try {
    await updateTruckRouteById(parseInt(id), name, parseInt(active, 10));
    res
      .status(200)
      .json(createResponse(200, "Truck route updated successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error updating truck route", error));
  }
};

// Delete truck route by ID
export const deleteTruckRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteTruckRouteById(parseInt(id));
    res
      .status(200)
      .json(createResponse(200, "Truck route deleted successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error deleting truck route", error));
  }
};
