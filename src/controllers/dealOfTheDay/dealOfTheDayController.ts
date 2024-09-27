import { Request, Response } from "express";
import {
  getAllDeals,
  createDeal,
  getDealById,
  updateDeal,
  deleteDealById,
  DealOfTheDay,
} from "../../models/dealOfTheDay/dealOfTheDayModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all deals
export const fetchDeals = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchTerm = req.query.searchTerm as string || '';

  const validLimits = [10, 25, 50, 100];
  if (!validLimits.includes(limit)) {
    return res.status(400).json(
      createResponse(
        400,
        "Invalid limit value. Please choose from 10, 25, 50, or 100."
      )
    );
  }

  try {
    const { deals, total } = await getAllDeals(page, limit, searchTerm);
    res.json(
      createResponse(200, "Deals fetched successfully.", {
        deals,
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to fetch deals."));
  }
};

// Create a new deal
export const addDeal = async (req: Request, res: Response) => {
  const {
    food_id,
    unit,
    price,
    offer_price,
    quantity,
    description,
    status,
    weightage,
  } = req.body;

  // Validate required fields
  if (!food_id || !price || !offer_price || !quantity) {
    return res.status(400).json(createResponse(400, "Missing required fields."));
  }

  try {
    await createDeal({
      food_id,
      unit,
      price,
      offer_price,
      quantity,
      description,
      status,
      weightage,
    });
    res.status(201).json(createResponse(201, "Deal created successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to create deal."));
  }
};

// Get a deal by ID
export const fetchDealById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deal: DealOfTheDay | null = await getDealById(Number(id));
    if (!deal) {
      return res.status(404).json(createResponse(404, "Deal not found."));
    }
    res.json(createResponse(200, "Deal fetched successfully.", deal));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to fetch deal."));
  }
};

// Update a deal by ID
export const updateDealById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dealData = req.body; // assuming dealData matches the structure needed

  try {
    await updateDeal(Number(id), dealData);
    res.json(createResponse(200, "Deal updated successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to update deal."));
  }
};

// Delete a deal by ID
export const removeDeal = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteDealById(Number(id));
    res.json(createResponse(200, "Deal deleted successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to delete deal."));
  }
};
