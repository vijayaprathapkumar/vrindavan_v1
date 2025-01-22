import { Request, Response } from "express";
import {
  getDiscontinuedCustomers,
  getDiscontinuedCustomersCount,
} from "../../models/discontinuedCustomersModel/discontinuedCustomersModel";
import { createResponse } from "../../utils/responseHandler";

export const fetchDiscontinuedCustomers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortField = (req.query.sortField as string) || 'name';
    const sortOrder = (req.query.sortOrder as string) || "";
    const searchTerm = (req.query.searchTerm as string) || '';
    const offset = (page - 1) * limit;

    const discontinuedCustomers = await getDiscontinuedCustomers(
      limit,
      offset,
      sortField,
      sortOrder as 'asc' | 'desc',
      searchTerm
    );

    if (discontinuedCustomers.length === 0) {
      return res
        .status(404)
        .json(createResponse(404, "No discontinued customers found."));
    }

    const totalCount = await getDiscontinuedCustomersCount();

    return res.status(200).json(
      createResponse(200, "Discontinued customers fetched successfully", {
        discontinuedCustomers,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      })
    );
  } catch (error) {
    console.error("Error fetching discontinued customers:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to fetch discontinued customers."));
  }
};