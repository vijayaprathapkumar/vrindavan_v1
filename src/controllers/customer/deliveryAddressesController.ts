import { Request, Response } from "express";
import {
  deleteDeliveryAddressById,
  getDeliveryAddress,
  updateDeliveryAddressById,
} from "../../models/customer/deliveryAddressesModel";

export const getDeliveryAddresses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = req.query.searchTerm
    ? (req.query.searchTerm as string)
    : "";
  const sortField = (req.query.sortField as string) || "created_at";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

  try {
    const { deliveryAddresses, total } = await getDeliveryAddress(
      page,
      limit,
      searchTerm,
      sortField,
      sortOrder
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      statusCode: 200,
      message: "Delivery addresses fetched successfully",
      data: {
        deliveryAddresses,
        totalCount: total,
        currentPage: page,
        limit,
        totalPages,
        sortField,
        sortOrder,
      },
    });
  } catch (error: any) {
    console.error("Error fetching delivery addresses:", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Error fetching delivery addresses",
      error: error.message,
    });
  }
};

export const updateDeliveryAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { locality_id, approveStatus } = req.body;

  if (locality_id === undefined || approveStatus === undefined) {
    res.status(400).json({
      statusCode: 400,
      message: "Missing required fields: locality_id, or approveStatus",
    });
    return;
  }

  try {
    const updatedDeliveryAddress = await updateDeliveryAddressById(
      parseInt(id),
      Number(approveStatus),
      Number(locality_id)
    );

    if (updatedDeliveryAddress) {
      if (Number(approveStatus) === 0 || Number(approveStatus) === 1) {
        res.status(200).json({
          statusCode: 200,
          message: `Delivery address updated successfully with approveStatus ${approveStatus}`,
          data: null,
        });
      } else {
        res.status(200).json({
          statusCode: 200,
          message: "Delivery address updated successfully",
        });
      }
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Delivery address not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error updating delivery address",
      error: (error as Error).message,
    });
  }
};

export const deleteDeliveryAddress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const isDeleted = await deleteDeliveryAddressById(parseInt(id, 10));

    if (isDeleted) {
      res.status(200).json({
        statusCode: 200,
        message: "Delivery address deleted successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Delivery address not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Error deleting delivery address",
      error: error.message,
    });
  }
};
