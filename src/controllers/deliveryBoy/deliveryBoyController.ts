import { Request, Response } from "express";
import {
  createDeliveryBoy,
  getDeliveryBoyById,
  updateDeliveryBoyById,
  deleteDeliveryBoyById,
  getAllDeliveryBoysWithLocalities,
  DeliveryBoyData,
  deleteLocalitiesByDeliveryBoyId,
} from "../../models/deliveryBoy/deliveryBoyModel";
import { createResponse } from "../../utils/responseHandler";
import { db } from "../../config/databaseConnection";

// Fetch all delivery boys
export const getDeliveryBoysWithLocalities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

    const searchTerm = req.query.searchTerm
      ? (req.query.searchTerm as string)
      : "";
    const sortField = req.query.sortField
      ? (req.query.sortField as string)
      : "";
    const sortOrder = req.query.sortOrder
      ? (req.query.sortOrder as string)
      : "";

    const { deliveryBoys, totalCount } = await getAllDeliveryBoysWithLocalities(
      limit,
      page,
      searchTerm,
      sortField.toString(),
      sortOrder.toString()
    );

    const totalPages = Math.ceil(totalCount / limit);
    res.status(200).json(
      createResponse(200, "Delivery boys and localities fetched successfully", {
        deliveryBoys,
        totalCount,
        limit,
        currentPage: page,
        totalPages: totalPages,
      })
    );

  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Error fetching delivery boys and localities",
          error
        )
      );
  }
};

export const addDeliveryBoy = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data: DeliveryBoyData = req.body;
    await createDeliveryBoy(data);
    res
      .status(201)
      .json(createResponse(201, "Delivery boy created successfully"));
  } catch (error) {
    console.error("Error creating delivery boy:", error);
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Error creating delivery boy",
          error.message || error
        )
      );
  }
};

// Get delivery boy by ID
export const getDeliveryBoy = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const deliveryBoy = await getDeliveryBoyById(parseInt(id));
    if (deliveryBoy.length === 0) {
      res.status(404).json(createResponse(404, "Delivery boy not found"));
    } else {
      res
        .status(200)
        .json(
          createResponse(200, "Delivery boy fetched successfully", deliveryBoy)
        );
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching delivery boy", error));
  }
};

// Update delivery boy by ID
export const updateDeliveryBoy = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    longitudePickup,
    localityIds,
  } = req.body;

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    // Step 1: Update delivery boy details
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

    // Step 2: Compare current and new localityIds
    const [currentRows] = await connection.query(
      `SELECT locality_id FROM locality_delivery_boys WHERE delivery_boy_id = ?`,
      [userId]
    );

    const currentLocalityIds = (currentRows as any[]).map((row) => row.locality_id).sort();
    const newLocalityIds = [...(localityIds || [])].sort();

    const isSame =
      currentLocalityIds.length === newLocalityIds.length &&
      currentLocalityIds.every((val, index) => val === newLocalityIds[index]);

    if (!isSame && newLocalityIds.length > 0) {
      // Step 3.1: Remove existing locality assignments for this delivery boy
      await connection.query(
        `DELETE FROM locality_delivery_boys WHERE delivery_boy_id = ?`,
        [userId]
      );

      // Step 3.2: Remove these localityIds from any other delivery boy
      await connection.query(
        `DELETE FROM locality_delivery_boys WHERE locality_id IN (?) AND delivery_boy_id != ?`,
        [newLocalityIds, userId]
      );

      // Step 3.3: Assign new localities to this delivery boy
      const values = newLocalityIds.map((localityId) => [
        userId,
        localityId,
        new Date(),
        new Date(),
      ]);

      await connection.query(
        `INSERT INTO locality_delivery_boys (delivery_boy_id, locality_id, created_at, updated_at) 
         VALUES ?`,
        [values]
      );
    }

    await connection.commit();
    res.status(200).json(createResponse(200, "Delivery boy updated successfully"));
  } catch (error) {
    await connection.rollback();
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Error updating delivery boy",
          error.message || error
        )
      );
  } finally {
    connection.release();
  }
};


// Delete delivery boy by ID
export const deleteDeliveryBoy = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteDeliveryBoyById(parseInt(id));
    res
      .status(200)
      .json(createResponse(200, "Delivery boy deleted successfully"));
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error deleting delivery boy", error));
  }
};

export const deleteLocalitiesForDeliveryBoy = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const parsedDeliveryBoyLocalityId = parseInt(id);

  // Validate deliveryBoyId
  if (isNaN(parsedDeliveryBoyLocalityId)) {
    res.status(400).json(createResponse(400, "Invalid deliveryBoyId provided"));
    return;
  }

  // Normalize localityIds to an array
  if (!id) {
    res
      .status(400)
      .json(createResponse(400, "No locality IDs provided for deletion"));
    return;
  }

  try {
    await deleteLocalitiesByDeliveryBoyId(parsedDeliveryBoyLocalityId);
    res
      .status(200)
      .json(createResponse(200, "Localities removed successfully"));
  } catch (error: any) {
    if (
      error.message === "No matching locality assignments found for deletion."
    ) {
      res
        .status(404)
        .json(createResponse(404, "Localities not found for deletion"));
    } else {
      res
        .status(500)
        .json(createResponse(500, "Error removing localities", error));
    }
  }
};
