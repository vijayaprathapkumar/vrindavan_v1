"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDeal = exports.updateDeal = exports.fetchDealById = exports.addDeal = exports.fetchDeals = void 0;
const dealOfTheDayModel_1 = require("../../models/dealOfTheDay/dealOfTheDayModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all deals
const fetchDeals = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || '';
    const sortField = req.query.sortField || 'weightage';
    const sortOrder = req.query.sortOrder || 'ASC';
    try {
        const { deals, total } = await (0, dealOfTheDayModel_1.getAllDeals)(page, limit, searchTerm, sortField, sortOrder);
        if (!deals || deals.length === 0 || total === 0) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "No deals found."));
        }
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Deals fetched successfully.", {
            deals,
            totalCount: total,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        console.error("Error fetching deals:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching deals.", error.message));
    }
};
exports.fetchDeals = fetchDeals;
// Create a new deal
const addDeal = async (req, res) => {
    const { foodId, unit, price, offer_price, quantity, description, status, weightage, } = req.body;
    if (!foodId || !price || !offer_price || !quantity) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Missing required fields."));
    }
    try {
        await (0, dealOfTheDayModel_1.createDeal)({
            foodId,
            unit,
            price,
            offer_price,
            quantity,
            description,
            status,
            weightage,
        });
        return res.status(201).json((0, responseHandler_1.createResponse)(201, "Deal created successfully."));
    }
    catch (error) {
        console.error("Error creating deal:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating deal.", error.message));
    }
};
exports.addDeal = addDeal;
// Get a deal by ID
const fetchDealById = async (req, res) => {
    const dealId = Number(req.params.id);
    if (isNaN(dealId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid deal ID."));
    }
    try {
        const deal = await (0, dealOfTheDayModel_1.getDealById)(dealId);
        if (!deal) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Deal not found."));
        }
        const response = { deals: [deal] };
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Deal fetched successfully.", response));
    }
    catch (error) {
        console.error("Error fetching deal:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching deal.", error.message));
    }
};
exports.fetchDealById = fetchDealById;
// Update a deal by ID
const updateDeal = async (req, res) => {
    const dealId = Number(req.params.id);
    const dealData = req.body;
    if (isNaN(dealId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid deal ID."));
    }
    try {
        const result = await (0, dealOfTheDayModel_1.updateDeals)(dealId, dealData);
        if (result.affectedRows > 0) {
            return res.status(200).json((0, responseHandler_1.createResponse)(200, "Deal updated successfully."));
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Deal not found."));
        }
    }
    catch (error) {
        console.error("Error updating deal:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating deal.", error.message));
    }
};
exports.updateDeal = updateDeal;
// Delete a deal by ID
const removeDeal = async (req, res) => {
    const dealId = Number(req.params.id);
    if (isNaN(dealId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid deal ID."));
    }
    try {
        const result = await (0, dealOfTheDayModel_1.deleteDealById)(dealId);
        if (result.affectedRows > 0) {
            return res.status(200).json((0, responseHandler_1.createResponse)(200, "Deal deleted successfully."));
        }
        else {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Deal not found."));
        }
    }
    catch (error) {
        console.error("Error deleting deal:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting deal.", error.message));
    }
};
exports.removeDeal = removeDeal;
