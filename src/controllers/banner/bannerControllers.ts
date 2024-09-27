import { Request, Response } from "express";
import {
  getAllBanners,
  createBanner,
  getBannerById,
  updateBanner as updateBannerInDB,
  deleteBannerById,
  Banner,
} from "../../models/banner/bannerModel";
import { createResponse } from "../../utils/responseHandler";

// Fetch all banners
export const fetchBanners = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10; 
  const searchTerm = req.query.searchTerm as string || ''; 

  const validLimits = [10, 25, 50, 100];
  if (!validLimits.includes(limit)) {
    return res
      .status(400)
      .json(
        createResponse(
          400,
          "Invalid limit value. Please choose from 10, 25, 50, or 100."
        )
      );
  }

  try {
    const { banners, total } = await getAllBanners(page, limit, searchTerm);
    res.json(
      createResponse(200, "Banners fetched successfully.", {
        banners,
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to fetch banners."));
  }
};

// Create a new banner
export const addBanner = async (req: Request, res: Response) => {
  const {
    banner_name, 
    banner_type, 
    banner_location,
    banner_link, 
    banner_content,
    food_id,
    banner_weightage, 
    date_from, 
    date_to, 
    status, 
    banner_image, 
  } = req.body;

  try {
    await createBanner({
      banner_name,
      banner_type,
      banner_location,
      banner_link,
      banner_content,
      food_id,
      banner_weightage,
      date_from,
      date_to,
      status,
      banner_image,
    });
    res.status(201).json(createResponse(201, "Banner created successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to create banner."));
  }
};

// Get a banner by ID
export const fetchBannerById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const banner: Banner | null = await getBannerById(Number(id));
    if (!banner) {
      return res.status(404).json(createResponse(404, "Banner not found."));
    }
    res.json(createResponse(200, "Banner fetched successfully.", banner));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to fetch banner."));
  }
};

// Update a banner by ID
export const updateBanner = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    banner_name,
    banner_type,
    banner_location,
    banner_link,
    banner_content,
    food_id,
    banner_weightage,
    date_from,
    date_to,
    status,
    banner_image,
  } = req.body;

  try {
    await updateBannerInDB(
      Number(id),
      banner_name,
      banner_type,
      banner_location,
      banner_link,
      banner_content,
      food_id,
      banner_weightage,
      date_from,
      date_to,
      status,
      banner_image
    );
    res.json(createResponse(200, "Banner updated successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to update banner."));
  }
};

// Delete a banner by ID
export const deleteBanner = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteBannerById(Number(id));
    res.json(createResponse(200, "Banner deleted successfully."));
  } catch (error) {
    res.status(500).json(createResponse(500, "Failed to delete banner."));
  }
};
