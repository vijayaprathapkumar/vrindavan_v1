import { Request, Response } from "express";
import {
  getAllDetailedCommissions,
  getDetailedCommissionById,
  createDetailedCommission,
  updateDetailedCommissionById,
  deleteDetailedCommissionById,
} from "../../models/deliveryBoy/commissionModel";
import { createResponse } from "../../utils/responseHandler";

export const getDetailedCommissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const commissions = await getAllDetailedCommissions();
    res.status(200).json(createResponse(200, "Detailed commissions fetched successfully", commissions));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching detailed commissions", error));
  }
};

export const getDetailedCommission = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const commission = await getDetailedCommissionById(parseInt(id));
    if (commission.length === 0) {
      res.status(404).json(createResponse(404, "Detailed commission not found"));
    } else {
      res.status(200).json(createResponse(200, "Detailed commission fetched successfully", commission));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching detailed commission", error));
  }
};

export const addDetailedCommission = async (req: Request, res: Response): Promise<void> => {
  const { monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year } = req.body;
  try {
    await createDetailedCommission(monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year);
    res.status(201).json(createResponse(201, "Detailed commission created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating detailed commission", error));
  }
};

export const updateDetailedCommission = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year } = req.body;
  try {
    await updateDetailedCommissionById(parseInt(id), monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year);
    res.status(200).json(createResponse(200, "Detailed commission updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating detailed commission", error));
  }
};

export const deleteDetailedCommission = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteDetailedCommissionById(parseInt(id));
    res.status(200).json(createResponse(200, "Detailed commission deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting detailed commission", error));
  }
};
