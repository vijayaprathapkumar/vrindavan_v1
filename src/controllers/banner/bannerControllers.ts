import { Request, Response } from "express";
import {
  getAllBanners,
  createBanner,
  getBannerById,
  updateBanner as updateBannerInDB,
  deleteBannerById,
} from "../../models/banner/bannerModel";
import { createResponse } from "../../utils/responseHandler";
import {
  insertMediaRecord,
  updateMediaRecord,
} from "../imageUpload/imageUploadController";

// Fetch all banners
export const fetchBanners = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = (req.query.searchTerm as string) || "";
  const sortField = (req.query.sortField as string) || "";
  const sortOrder = (req.query.sortOrder as string) || "";

  try {
    const { banners, total } = await getAllBanners(
      page,
      limit,
      searchTerm,
      sortField,
      sortOrder
    );

    if (!banners || banners.length === 0 || total === 0) {
      return res.status(404).json(createResponse(404, "No banners found."));
    }

    const totalPages = Math.ceil(total / limit);
    return res.status(200).json(
      createResponse(200, "Banners fetched successfully.", {
        banners,
        totalCount: total,
        totalPages,
        currentPage: page,
        limit,
      })
    );
  } catch (error) {
    console.error("Error fetching banners:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching banners.", error.message));
  }
};

// Create a new banner
export const addBanner = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
    media,
  } = req.body;

  try {
    const bannerId = await createBanner({
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
    });
    if (media) {
      const { model_type, file_name, mime_type, size } = media;
      await insertMediaRecord(model_type, bannerId, file_name, mime_type, size);
    }

    return res
      .status(201)
      .json(createResponse(201, "Banner created successfully."));
  } catch (error) {
    console.error("Error creating banner:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error creating banner.", error.message));
  }
};

// Get a banner by ID
export const fetchBannerById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const bannerId = Number(req.params.id);

  if (isNaN(bannerId)) {
    return res.status(400).json(createResponse(400, "Invalid banner ID."));
  }

  try {
    const banner = await getBannerById(bannerId);

    if (!banner) {
      return res.status(404).json(createResponse(404, "Banner not found."));
    }
    const responce = { banners: [banner] };
    return res
      .status(200)
      .json(createResponse(200, "Banner fetched successfully.", responce));
  } catch (error) {
    console.error("Error fetching banner:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching banner.", error.message));
  }
};

// Update a banner by ID
export const updateBanner = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const bannerId = Number(req.params.id);
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
    media,
  } = req.body;

  if (isNaN(bannerId)) {
    return res.status(400).json(createResponse(400, "Invalid banner ID."));
  }

  try {
    const result = await updateBannerInDB(
      bannerId,
      banner_name,
      banner_type,
      banner_location,
      banner_link,
      banner_content,
      food_id,
      banner_weightage,
      date_from,
      date_to,
      status
    );

    if (result.affectedRows > 0) {
      if (media && media.media_id) {
        const { media_id, file_name, mime_type, size } = media;
        await updateMediaRecord(media_id, file_name, mime_type, size);
      }

      return res
        .status(200)
        .json(createResponse(200, "Banner updated successfully."));
    } else {
      return res.status(404).json(createResponse(404, "Banner not found."));
    }
  } catch (error) {
    console.error("Error updating banner:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error updating banner.", error.message));
  }
};

// Delete a banner by ID
export const deleteBanner = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const bannerId = Number(req.params.id);

  if (isNaN(bannerId)) {
    return res.status(400).json(createResponse(400, "Invalid banner ID."));
  }

  try {
    const result = await deleteBannerById(bannerId);

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json(createResponse(200, "Banner deleted successfully."));
    } else {
      return res.status(404).json(createResponse(404, "Banner not found."));
    }
  } catch (error) {
    console.error("Error deleting banner:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error deleting banner.", error.message));
  }
};
