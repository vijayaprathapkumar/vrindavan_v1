"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletLogs = exports.getWalletBalanceWithOutUserId = exports.getWalletBalance = void 0;
const walletBalanceModel_1 = require("../../models/wallet/walletBalanceModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getWalletBalance = async (req, res) => {
    const { userId } = req.params;
    try {
        const walletBalance = await (0, walletBalanceModel_1.getWalletBalanceByUserId)(userId);
        if (!walletBalance) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "User not found"));
        }
        const balance = walletBalance.balance;
        const response = { walletBalance: [{ ...walletBalance, balance }] };
        return res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Wallet balance retrieved successfully", response));
    }
    catch (error) {
        console.error("Error retrieving wallet balance:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error retrieving wallet balance", error.message));
    }
};
exports.getWalletBalance = getWalletBalance;
//without UserId
const getWalletBalanceWithOutUserId = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const searchTerm = req.query.searchTerm;
        const sortField = req.query.sortField;
        const sortOrder = req.query.sortOrder;
        const { walletBalances, totalCount } = await (0, walletBalanceModel_1.getWalletBalanceByWithOutUserId)(page, limit, startDate, endDate, searchTerm, sortField, sortOrder);
        if (!walletBalances || walletBalances.length === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "No wallet balances found"));
        }
        const totalPages = Math.ceil(totalCount / limit);
        const response = {
            walletBalances,
            currentPage: page,
            limit,
            totalCount,
            totalPages,
        };
        return res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Wallet balances retrieved successfully", response));
    }
    catch (error) {
        console.error("Error retrieving wallet balance:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error retrieving wallet balance", error.message));
    }
};
exports.getWalletBalanceWithOutUserId = getWalletBalanceWithOutUserId;
const getWalletLogs = async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        // Fetch wallet logs with food details
        const walletLogsWithFood = await (0, walletBalanceModel_1.getWalletLogsWithFoodDetails)(userId, page, limit);
        // Handle case where no wallet logs are found
        if (!walletLogsWithFood || walletLogsWithFood.length === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "No wallet logs found for this user"));
        }
        const totalCount = walletLogsWithFood.length;
        const totalPages = Math.ceil(totalCount / limit);
        const response = {
            walletLogs: walletLogsWithFood,
            page,
            limit,
            totalCount,
            totalPages,
        };
        return res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Wallet logs retrieved successfully", response));
    }
    catch (error) {
        console.error("Error fetching wallet logs:", error.message);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Internal Server Error", error.message));
    }
};
exports.getWalletLogs = getWalletLogs;
