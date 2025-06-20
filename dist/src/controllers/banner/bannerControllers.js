"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.fetchBannerById = exports.addBanner = exports.fetchBanners = void 0;
const bannerModel_1 = require("../../models/banner/bannerModel");
const responseHandler_1 = require("../../utils/responseHandler");
const imageUploadController_1 = require("../imageUpload/imageUploadController");
// Fetch all banners
const fetchBanners = async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const searchTerm = req.query.searchTerm || "";
    const sortField = req.query.sortField || "";
    const sortOrder = req.query.sortOrder || "";
    try {
        const { banners, total } = await (0, bannerModel_1.getAllBanners)(page, limit, searchTerm, sortField, sortOrder);
        if (!banners || banners.length === 0 || total === 0) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "No banners found."));
        }
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Banners fetched successfully.", {
            banners,
            totalCount: total,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        console.error("Error fetching banners:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching banners.", error.message));
    }
};
exports.fetchBanners = fetchBanners;
// Create a new banner
const addBanner = async (req, res) => {
    const { banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, media, } = req.body;
    try {
        const bannerId = await (0, bannerModel_1.createBanner)({
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
            await (0, imageUploadController_1.insertMediaRecord)(model_type, bannerId, file_name, mime_type, size);
        }
        return res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Banner created successfully."));
    }
    catch (error) {
        console.error("Error creating banner:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating banner.", error.message));
    }
};
exports.addBanner = addBanner;
// Get a banner by ID
const fetchBannerById = async (req, res) => {
    const bannerId = Number(req.params.id);
    if (isNaN(bannerId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid banner ID."));
    }
    try {
        const banner = await (0, bannerModel_1.getBannerById)(bannerId);
        if (!banner) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Banner not found."));
        }
        const responce = { banners: [banner] };
        return res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Banner fetched successfully.", responce));
    }
    catch (error) {
        console.error("Error fetching banner:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching banner.", error.message));
    }
};
exports.fetchBannerById = fetchBannerById;
// Update a banner by ID
const updateBanner = async (req, res) => {
    const bannerId = Number(req.params.id);
    const { banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, media, } = req.body;
    if (isNaN(bannerId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid banner ID."));
    }
    try {
        const result = await (0, bannerModel_1.updateBanner)(bannerId, banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status);
        if (result.affectedRows > 0) {
            if (media && media.media_id) {
                const { media_id, file_name, mime_type, size } = media;
                await (0, imageUploadController_1.updateMediaRecord)(media_id, file_name, mime_type, size);
            }
            return res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Banner updated successfully."));
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Banner not found."));
        }
    }
    catch (error) {
        console.error("Error updating banner:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating banner.", error.message));
    }
};
exports.updateBanner = updateBanner;
// Delete a banner by ID
const deleteBanner = async (req, res) => {
    const bannerId = Number(req.params.id);
    if (isNaN(bannerId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid banner ID."));
    }
    try {
        const result = await (0, bannerModel_1.deleteBannerById)(bannerId);
        if (result.affectedRows > 0) {
            return res
                .status(200)
                .json((0, responseHandler_1.createResponse)(200, "Banner deleted successfully."));
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Banner not found."));
        }
    }
    catch (error) {
        console.error("Error deleting banner:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deleting banner.", error.message));
    }
};
exports.deleteBanner = deleteBanner;
