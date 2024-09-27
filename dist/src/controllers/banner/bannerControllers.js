"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBanner = exports.updateBanner = exports.fetchBannerById = exports.addBanner = exports.fetchBanners = void 0;
const bannerModel_1 = require("../../models/banner/bannerModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all banners
const fetchBanners = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || '';
    const validLimits = [10, 25, 50, 100];
    if (!validLimits.includes(limit)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid limit value. Please choose from 10, 25, 50, or 100."));
    }
    try {
        const { banners, total } = await (0, bannerModel_1.getAllBanners)(page, limit, searchTerm);
        res.json((0, responseHandler_1.createResponse)(200, "Banners fetched successfully.", {
            banners,
            total,
            page,
            limit,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch banners."));
    }
};
exports.fetchBanners = fetchBanners;
// Create a new banner
const addBanner = async (req, res) => {
    const { banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, banner_image, } = req.body;
    try {
        await (0, bannerModel_1.createBanner)({
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
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Banner created successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to create banner."));
    }
};
exports.addBanner = addBanner;
// Get a banner by ID
const fetchBannerById = async (req, res) => {
    const { id } = req.params;
    try {
        const banner = await (0, bannerModel_1.getBannerById)(Number(id));
        if (!banner) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Banner not found."));
        }
        res.json((0, responseHandler_1.createResponse)(200, "Banner fetched successfully.", banner));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch banner."));
    }
};
exports.fetchBannerById = fetchBannerById;
// Update a banner by ID
const updateBanner = async (req, res) => {
    const { id } = req.params;
    const { banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, banner_image, } = req.body;
    try {
        await (0, bannerModel_1.updateBanner)(Number(id), banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, banner_image);
        res.json((0, responseHandler_1.createResponse)(200, "Banner updated successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update banner."));
    }
};
exports.updateBanner = updateBanner;
// Delete a banner by ID
const deleteBanner = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, bannerModel_1.deleteBannerById)(Number(id));
        res.json((0, responseHandler_1.createResponse)(200, "Banner deleted successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to delete banner."));
    }
};
exports.deleteBanner = deleteBanner;
