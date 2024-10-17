import { Request, Response } from "express";
import {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../../models/customer/customerModel";
import { createResponse } from "../../utils/responseHandler";
import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

// Fetch all customers with pagination and filters
export const getCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page = 1, limit = 10, locality, status, searchTerm } = req.query;

  const validLimit = Number(limit) > 0 ? Number(limit) : 10;

  try {
    const { customers, total } = await getAllCustomers(
      Number(page),
      validLimit,
      locality?.toString(),
      status?.toString(),
      searchTerm?.toString()
    );

    const totalPages = Math.ceil(total / validLimit);
    res.status(200).json({
      statusCode: 200,
      message: "Customers fetched successfully",
      data: {
        customer: customers,
        totalCount: total,
        currentPage: Number(page),
        limit: validLimit,
        totalPage: totalPages,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching customers", error));
  }
};
export const addCustomer = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { localityId, name, email, mobile, houseNo, completeAddress, status } =
    req.body;

  try {
    const existingUserQuery = `
      SELECT id FROM users WHERE email = ?;
    `;
    const [existingUsers] = await db
      .promise()
      .query<RowDataPacket[]>(existingUserQuery, [email]);

    if (existingUsers.length > 0) {
      
      return res.status(400).json({
        statusCode: 400,
        message: "This email is already registered",
      });
    }

    await createCustomer(
      localityId,
      name,
      email,
      mobile,
      houseNo,
      completeAddress,
      status
    );

    res.status(201).json({
      statusCode: 201,
      message: "Customer created successfully",
      data: {
        customer: null,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error creating customer", error.message));
  }
};


// Get customer by ID
export const getCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const customer = await getCustomerById(parseInt(id));
    if (!customer) {
      res.status(404).json({
        statusCode: 404,
        message: "Customer not found",
        data: {
          customer: null,
        },
      });
    } else {
      res.status(200).json({
        statusCode: 200,
        message: "Customer fetched successfully",
        data: {
          customer: [customer],
        },
      });
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching customer", error));
  }
};

// Update customer by ID
export const updateCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { localityId, name, email, mobile, houseNo, completeAddress, status } =
    req.body;

  try {
    await updateCustomerById(
      parseInt(id),
      localityId,
      name,
      email,
      mobile,
      houseNo,
      completeAddress,
      status
    );

    res.status(200).json({
      statusCode: 200,
      message: "Customer updated successfully",
      data: {
        customer: {
          id: parseInt(id),
        },
      },
    });
  } catch (error) {
    res
      .status(400)
      .json(createResponse(400, error.message, { customer: null }));
  }
};

// Delete customer by ID
export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    await deleteCustomerById(parseInt(id));
    res.status(200).json({
      statusCode: 200,
      message: "Customer deleted successfully",
      data: {
        customer: {
          id: parseInt(id),
        },
      },
    });
  } catch (error) {
    res.status(500).json(createResponse(500, "Error deleting customer", error));
  }
};
