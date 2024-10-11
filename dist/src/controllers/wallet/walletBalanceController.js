"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletBalance = void 0;
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
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Wallet balance retrieved successfully", response));
    }
    catch (error) {
        console.error("Error retrieving wallet balance:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Error retrieving wallet balance", error.message));
    }
};
exports.getWalletBalance = getWalletBalance;
