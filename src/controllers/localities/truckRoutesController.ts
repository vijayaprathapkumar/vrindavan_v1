import { Request, Response } from "express";
import {
  getAllTruckRoutes,
  createTruckRoute,
  getTruckRouteById,
  updateTruckRouteById,
  deleteTruckRouteById,
} from "../../models/localities/truckRoutesModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all truck routes with pagination and filters
export const getTruckRoutes = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
   
    searchTerm = "",
    sortField = "",
    sortOrder = "",
  } = req.query;
 
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string) || 1;
  try {
    const { routes, totalRecords } = await getAllTruckRoutes(
      Number(page),
      limit,
      searchTerm.toString(),
      sortField.toString(),
      sortOrder.toString()
    );
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
  } catch (error) {
    console.error("Error fetching truck routes:", error);
    res
      .status(500)
      .json(createResponse(500, "Error fetching truck routes", error.message));
  }
};

// Add a new truck route
export const addTruckRoute = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, active } = req.body;
  try {
    await createTruckRoute(name, active);

    res.status(201).json({
      statusCode: 201,
      message: "Truck route created successfully",
      data: {
        truckRoute: null,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error creating truck route", error.message));
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
    if (!truckRoute) {
      res.status(404).json(createResponse(404, "Truck route not found"));
    } else {
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
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching truck route", error.message));
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

    res.status(200).json({
      statusCode: 200,
      message: "Truck route updated successfully",
      data: {
        truckRoute: {
          updateTruck_id: parseInt(id),
        },
      },
    });
  } catch (error) {
    res
      .status(400)
      .json(createResponse(400, "Error updating truck route", error.message));
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
    res.status(200).json({
      statusCode: 200,
      message: "Truck route deleted successfully",
      data: {
        truckRoute: {
          deleteTruck_id: parseInt(id),
        },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error deleting truck route", error.message));
  }
};
