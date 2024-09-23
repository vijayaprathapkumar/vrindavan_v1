import { Request, Response } from "express";
import {
  getAllDeliveryBoys,
  createDeliveryBoy,
  getDeliveryBoyById,
  updateDeliveryBoyById,
  deleteDeliveryBoyById,
} from "../../models/deliveryBoy/deliveryBoyModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all delivery boys
export const getDeliveryBoys = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10; // Default limit to 10
    const page = parseInt(req.query.page as string) || 1; // Default page to 1
    const offset = (page - 1) * limit;
    const searchTerm = req.query.searchTerm ? (req.query.searchTerm as string) : '';

    // Fetch filtered delivery boys and total count
    const { deliveryBoys, totalCount } = await getAllDeliveryBoys(limit, offset, searchTerm);

    res.status(200).json(
      createResponse(200, "Delivery boys fetched successfully", {
        deliveryBoys,
        totalCount,
        limit,
        page,
        totalPages: Math.ceil(totalCount / limit), // Calculate total pages
      })
    );
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching delivery boys", error));
  }
};




// Add a new delivery boy
export const addDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  const {
    userId,
    name,
    mobile,
    active,
    cashCollection,
    deliveryFee,
    totalOrders,
    earning,
    available,
    addressPickup,
    latitudePickup,
    longitudePickup
  } = req.body;
  try {
    await createDeliveryBoy(
      userId,
      name,
      mobile,
      active,
      cashCollection,
      deliveryFee,
      totalOrders,
      earning,
      available,
      addressPickup,
      latitudePickup,
      longitudePickup
    );
    res.status(201).json(createResponse(201, "Delivery boy created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating delivery boy", error));
  }
};

// Get delivery boy by ID
export const getDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const deliveryBoy = await getDeliveryBoyById(parseInt(id));
    if (deliveryBoy.length === 0) {
      res.status(404).json(createResponse(404, "Delivery boy not found"));
    } else {
      res
        .status(200)
        .json(createResponse(200, "Delivery boy fetched successfully", deliveryBoy));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching delivery boy", error));
  }
};

// Update delivery boy by ID
export const updateDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    userId,
    name,
    mobile,
    active,
    cashCollection,
    deliveryFee,
    totalOrders,
    earning,
    available,
    addressPickup,
    latitudePickup,
    longitudePickup
  } = req.body;
  try {
    await updateDeliveryBoyById(
      parseInt(id),
      userId,
      name,
      mobile,
      active,
      cashCollection,
      deliveryFee,
      totalOrders,
      earning,
      available,
      addressPickup,
      latitudePickup,
      longitudePickup
    );
    res.status(200).json(createResponse(200, "Delivery boy updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating delivery boy", error));
  }
};

// Delete delivery boy by ID
export const deleteDeliveryBoy = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteDeliveryBoyById(parseInt(id));
    res.status(200).json(createResponse(200, "Delivery boy deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting delivery boy", error));
  }
};
