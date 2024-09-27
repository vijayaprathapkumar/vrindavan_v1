"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDeal = exports.updateDealById = exports.fetchDealById = exports.addDeal = exports.fetchDeals = void 0;
const dealOfTheDayModel_1 = require("../../models/dealOfTheDay/dealOfTheDayModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all deals
const fetchDeals = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || '';
    const validLimits = [10, 25, 50, 100];
    if (!validLimits.includes(limit)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid limit value. Please choose from 10, 25, 50, or 100."));
    }
    try {
        const { deals, total } = await (0, dealOfTheDayModel_1.getAllDeals)(page, limit, searchTerm);
        res.json((0, responseHandler_1.createResponse)(200, "Deals fetched successfully.", {
            deals,
            total,
            page,
            limit,
        }));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch deals."));
    }
};
exports.fetchDeals = fetchDeals;
// Create a new deal
const addDeal = async (req, res) => {
    const { food_id, unit, price, offer_price, quantity, description, status, weightage, } = req.body;
    // Validate required fields
    if (!food_id || !price || !offer_price || !quantity) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Missing required fields."));
    }
    try {
        await (0, dealOfTheDayModel_1.createDeal)({
            food_id,
            unit,
            price,
            offer_price,
            quantity,
            description,
            status,
            weightage,
        });
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Deal created successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to create deal."));
    }
};
exports.addDeal = addDeal;
// Get a deal by ID
const fetchDealById = async (req, res) => {
    const { id } = req.params;
    try {
        const deal = await (0, dealOfTheDayModel_1.getDealById)(Number(id));
        if (!deal) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Deal not found."));
        }
        res.json((0, responseHandler_1.createResponse)(200, "Deal fetched successfully.", deal));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch deal."));
    }
};
exports.fetchDealById = fetchDealById;
// Update a deal by ID
const updateDealById = async (req, res) => {
    const { id } = req.params;
    const dealData = req.body; // assuming dealData matches the structure needed
    try {
        await (0, dealOfTheDayModel_1.updateDeal)(Number(id), dealData);
        res.json((0, responseHandler_1.createResponse)(200, "Deal updated successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update deal."));
    }
};
exports.updateDealById = updateDealById;
// Delete a deal by ID
const removeDeal = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, dealOfTheDayModel_1.deleteDealById)(Number(id));
        res.json((0, responseHandler_1.createResponse)(200, "Deal deleted successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to delete deal."));
    }
};
exports.removeDeal = removeDeal;
