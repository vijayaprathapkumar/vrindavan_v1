import { Request, Response } from "express";
import {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById
} from '../../models/customer/customerModel';
import { createResponse } from '../../utils/responseHandler';

// Fetch all customers
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await getAllCustomers();
    res.status(200).json(createResponse(200, "Customers fetched successfully", customers));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching customers", error));
  }
};

// Add a new customer
export const addCustomer = async (req: Request, res: Response): Promise<void> => {
  const { locality, name, email, mobile, house_no, complete_address, status } = req.body;
  try {
    await createCustomer(locality, name, email, mobile, house_no, complete_address, status);
    res.status(201).json(createResponse(201, "Customer created successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error creating customer", error));
  }
};

// Get customer by ID
export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const customer = await getCustomerById(parseInt(id));
    if (customer.length === 0) {
      res.status(404).json(createResponse(404, "Customer not found"));
    } else {
      res.status(200).json(createResponse(200, "Customer fetched successfully", customer));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching customer", error));
  }
};

// Update customer by ID
export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { locality, name, email, mobile, house_no, complete_address, status } = req.body;
  try {
    await updateCustomerById(parseInt(id), locality, name, email, mobile, house_no, complete_address, status);
    res.status(200).json(createResponse(200, "Customer updated successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error updating customer", error));
  }
};

// Delete customer by ID
export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteCustomerById(parseInt(id));
    res.status(200).json(createResponse(200, "Customer deleted successfully"));
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting customer", error));
  }
};
