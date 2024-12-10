import { Request, Response } from "express";
import {
  getAllDetailedCommissions,
  getDetailedCommissionById,
  updateCommission,
} from "../../models/deliveryBoy/commissionModel";
import { createResponse } from "../../utils/responseHandler";

export const getDetailedCommissions = async (req: Request, res: Response): Promise<void> => {
  const searchTerm = req.query.searchTerm as string || '';
  const categoryId = req.query.categoryId as string || ''; 
  const limit = parseInt(req.query.limit as string) || 10; 
  const page = parseInt(req.query.page as string) || 1; 
  const offset = (page - 1) * limit; 

  try {
    const result = await getAllDetailedCommissions(searchTerm, limit, offset, categoryId);
    const data = result.data;
    const totalCount = result.totalCount; 

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json(createResponse(200, "Detailed commissions fetched successfully", {
      commissions: data,
      totalCount,
      totalPages,
      currentPage: page,
      recordsPerPage: limit,
    }));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching detailed commissions", error));
  }
};


export const getDetailedCommission = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const commission = await getDetailedCommissionById(parseInt(id));
    if (!commission) {
      res
        .status(404)
        .json(createResponse(404, "Detailed commission not found"));
    } else {
      res
        .status(200)
        .json(
          createResponse(
            200,
            "Detailed commission fetched successfully",
            commission
          )
        );
    }
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching detailed commission", error));
  }
};

export const updateCommissionController = async (req: Request, res: Response): Promise<void> => {
  const { commissionId } = req.params;
  const { commissionValue } = req.body;

  try {
    const updatedCommission = await updateCommission(commissionId, commissionValue);

    if (updatedCommission) {
      res.status(200).json(createResponse(200, "Commission updated successfully", updatedCommission));
    } else {
      res.status(404).json(createResponse(404, "Commission not found"));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating commission", error));
  }
};