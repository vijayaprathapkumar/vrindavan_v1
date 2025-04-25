import { Request, Response } from "express";
import {
  getAllDeals,
  createDeal,
  getDealById,
  deleteDealById,
  updateDeals,
} from "../../models/dealOfTheDay/dealOfTheDayModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all deals
export const fetchDeals = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = (req.query.searchTerm as string) || "";
  const sortField = (req.query.sortField as string) || "weightage";
  const sortOrder = (req.query.sortOrder as string) || "ASC";

  try {
    const { deals, total } = await getAllDeals(
      page,
      limit,
      searchTerm,
      sortField,
      sortOrder
    );

    if (!deals || deals.length === 0 || total === 0) {
      return res.status(404).json(createResponse(404, "No deals found."));
    }

    const totalPages = Math.ceil(total / limit);
    return res.status(200).json(
      createResponse(200, "Deals fetched successfully.", {
        deals,
        totalCount: total,
        totalPages,
        currentPage: page,
        limit,
      })
    );
  } catch (error) {
    console.error("Error fetching deals:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching deals.", error.message));
  }
};

// Create a new deal
export const addDeal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    foodId,
    unit,
    price,
    offer_price,
    quantity,
    description,
    status,
    weightage,
  } = req.body;

  if (!foodId || !price || !offer_price || !quantity) {
    return res
      .status(400)
      .json(createResponse(400, "Missing required fields."));
  }

  try {
    await createDeal({
      foodId,
      unit,
      price,
      offer_price,
      quantity,
      description,
      status,
      weightage,
    });
    return res
      .status(201)
      .json(createResponse(201, "Deal created successfully."));
  } catch (error) {
    console.error("Error creating deal:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error creating deal.", error.message));
  }
};

// Get a deal by ID
export const fetchDealById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dealId = Number(req.params.id);

  if (isNaN(dealId)) {
    return res.status(400).json(createResponse(400, "Invalid deal ID."));
  }

  try {
    const deal = await getDealById(dealId);

    if (!deal) {
      return res.status(404).json(createResponse(404, "Deal not found."));
    }

    const response = { deals: [deal] };
    return res
      .status(200)
      .json(createResponse(200, "Deal fetched successfully.", response));
  } catch (error) {
    console.error("Error fetching deal:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching deal.", error.message));
  }
};

// Update a deal by ID
export const updateDeal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dealId = Number(req.params.id);
  const dealData = req.body;

  if (isNaN(dealId)) {
    return res.status(400).json(createResponse(400, "Invalid deal ID."));
  }

  try {
    const result = await updateDeals(dealId, dealData);

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json(createResponse(200, "Deal updated successfully."));
    } else {
      return res.status(404).json(createResponse(404, "Deal not found."));
    }
  } catch (error) {
    console.error("Error updating deal:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error updating deal.", error.message));
  }
};

// Delete a deal by ID
export const removeDeal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const dealId = Number(req.params.id);

  if (isNaN(dealId)) {
    return res.status(400).json(createResponse(400, "Invalid deal ID."));
  }

  try {
    const result = await deleteDealById(dealId);

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json(createResponse(200, "Deal deleted successfully."));
    } else {
      return res.status(404).json(createResponse(404, "Deal not found."));
    }
  } catch (error) {
    console.error("Error deleting deal:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error deleting deal.", error.message));
  }
};
