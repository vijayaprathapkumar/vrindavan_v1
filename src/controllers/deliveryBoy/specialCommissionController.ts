import { Request, Response } from "express";

import { createResponse } from "../../utils/responseHandler";
import {
  addSpecialCommission,
  getAllDetailedSpecialCommissions,
  getDetailedSpecialCommissionById,
  updateSpecialCommission,
} from "../../models/deliveryBoy/specialCommissionModel";

export const addSpecialCommissionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { categoryId, productId, standardCommission, specialCommission, deliveryBoyId } = req.body;

  if (!categoryId || !productId || !standardCommission || !specialCommission || !deliveryBoyId) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const commissionId = await addSpecialCommission(
      categoryId,
      productId,
      standardCommission,
      specialCommission,
      deliveryBoyId
    );

    res.status(201).json({
      message: "Special commission created successfully",
      commissionId,
    });
  } catch (error) {
    console.error("Error creating special commission:", error);
    res.status(500).json({ message: "Error creating special commission" });
  }
};

export const getDetailedSpecialCommissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const searchTerm = (req.query.searchTerm as string) || "";
  const categoryId = (req.query.categoryId as string) || "";
  const deliveryBoyId = (req.query.deliveryBoyId as string) || "";
  const limit = parseInt(req.query.limit as string);
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
  const { id } = req.params;
  const { categoryId, productId, standardCommission, specialCommission, deliveryBoyId } = req.body;

  try {
    const updatedCommission = await updateSpecialCommission(
      id,
      categoryId,
      productId,
      standardCommission,
      specialCommission,
      deliveryBoyId
    );

    res.status(200).json({
      message: "Special commission updated successfully",
      data: updatedCommission,
    });
  } catch (error) {
    console.error('Error updating special commission:', error);

    res.status(500).json({
      message: "Error updating special commission",
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};
