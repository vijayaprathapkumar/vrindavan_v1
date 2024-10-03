import { Request, Response } from "express";
import {
  getAllPayments,
  addPayment,
  updatePayment,
  deletePaymentById,
} from "../../models/payments/paymentsModels";
import { createResponse } from "../../utils/responseHandler";

// Fetch all payments for a user
export const fetchPayments = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page as string) || 1; 
    const limit = parseInt(req.query.limit as string) || 10;
  
    try {
      const { total, payments } = await getAllPayments(userId, page, limit);
      res.json(createResponse(200, "Payments fetched successfully.", {
        payments,
        totalRecords: total,
        page,
        limit,
      }));
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json(createResponse(500, "Failed to fetch payments."));
    }
  };

// Add a new payment
export const addPaymentController = async (req: Request, res: Response) => {
  const { price, description, userId } = req.body;

  const status = "active";
  const method = "wallet";

  try {
    const result = await addPayment({ price, description, userId, status, method });

    if (result.affectedRows > 0) {
      res.status(201).json(createResponse(201, "Payment added successfully."));
    } else {
      res.status(400).json(createResponse(400, "Failed to add payment."));
    }
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(500).json(createResponse(500, "Failed to add payment."));
  }
};

// Update a payment
export const updatePaymentController = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { price, description } = req.body;
  
    // Set default values for status and method
    const status = "active";
    const method = "wallet";
  
    try {
      await updatePayment(Number(id), { price, description, status, method });
      res.json(createResponse(200, "Payment updated successfully."));
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json(createResponse(500, "Failed to update payment."));
    }
  };
  
  // Delete a payment by ID
  export const removePayment = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      await deletePaymentById(Number(id));
      res.json(createResponse(200, "Payment deleted successfully."));
    } catch (error) {
      console.error("Error deleting payment:", error);
      res.status(500).json(createResponse(500, "Failed to delete payment."));
    }
  };
  