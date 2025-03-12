import { Request, Response } from "express";

import { createResponse } from "../../utils/responseHandler";
import {
  getAllDetailedSpecialCommissions,
  getDetailedSpecialCommissionById,
  updateSpecialCommission,
} from "../../models/deliveryBoy/specialCommissionModel";

export const getDetailedSpecialCommissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const searchTerm = (req.query.searchTerm as string) || "";
  const categoryId = (req.query.categoryId as string) || "";
  const deliveryBoyId = (req.query.deliveryBoyId as string) || "";
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const sortField = req.query.sortField as string || '';
  const sortOrder=  req.query.sortOrder as string || '';
  const offset = (page - 1) * limit;

  try {
    const result = await getAllDetailedSpecialCommissions(
      searchTerm,
      limit,
      offset,
      categoryId,
      deliveryBoyId,
      sortField,
      sortOrder
    );
    const data = result.data;
    const totalCount = result.totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json(
      createResponse(200, "Detailed special commissions fetched successfully", {
        commissions: data,
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Error fetching detailed special commissions",
          error
        )
      );
  }
};

export const getDetailedSpecialCommission = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const commission = await getDetailedSpecialCommissionById(parseInt(id));
    if (!commission) {
      res
        .status(404)
        .json(createResponse(404, "Detailed special commission not found"));
    } else {
      res
        .status(200)
        .json(
          createResponse(
            200,
            "Detailed special commission fetched successfully",
            commission
          )
        );
    }
  } catch (error) {
    res
      .status(500)
      .json(
        createResponse(500, "Error fetching detailed special commission", error)
      );
  }
};

export const updateSpecialCommissionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { categoryId, productId } = req.params; // Ensure these are passed as route params
  const { standardCommission, specialCommission, deliveryBoyId } = req.body;

  try {
    if (!categoryId || !productId || !specialCommission || !standardCommission) {
      res.status(400).json({
        status: 400,
        message: "Missing required parameters",
      });
      return;
    }

    const updatedCommission = await updateSpecialCommission(
      Number(categoryId),
      Number(productId),
      standardCommission,
      specialCommission,
      deliveryBoyId ? Number(deliveryBoyId) : null
    );

    if (updatedCommission) {
      res.status(200).json({
        status: 200,
        message: "Special commission updated successfully",
        data: updatedCommission,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Failed to update special commission",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error updating special commission",
      error: (error as Error).message,
    });
  }
};