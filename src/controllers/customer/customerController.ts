import { Request, Response } from "express";
import {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} from "../../models/customer/customerModel";
import { createResponse } from "../../utils/responseHandler";
import { checkUserProfileStatus } from "../../models/authLogin/authLoginModel";

export const getCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { locality, status, searchTerm, sortField, sortOrder } = req.query;

  const limit = req.query.limit === 'All' ? 0 : parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  try {
    const { customers, total, statusCount } = await getAllCustomers(
      page,
      limit,
      locality?.toString(),
      status?.toString(),
      searchTerm?.toString(),
      sortField?.toString(),
      sortOrder?.toString()
    );

    const totalPages = Math.ceil(total / limit);
    res.status(200).json(
      createResponse(200, "Customers fetched successfully", {
        customers,
        totalCount: total,
        currentPage: page,
        limit: limit,
        totalPages,
        statusCount,
      })
    );
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
    const userId = await createCustomer(
      localityId,
      name,
      email,
      mobile,
      houseNo,
      completeAddress,
      status
    );

    if (userId === null) {
      return res
        .status(400)
        .json(createResponse(400, "This email is already registered."));
    }

    if (userId === 0) {
      return res
        .status(400)
        .json(createResponse(400, "This mobile is already registered."));
    }

    const { status: userProfileStatus } = await checkUserProfileStatus(mobile);

    return res.status(201).json(
      createResponse(201, "Customer created successfully.", {
        user_profile: userProfileStatus,
        user_id: userId,
      })
    );
  } catch (error) {
    console.error("Error creating customer:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error creating customer", error.message));
  }
};

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
      return;
    }
    res.status(200).json({
      statusCode: 200,
      message: "Customer fetched successfully",
      data: {
        customer: [customer],
      },
    });
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
