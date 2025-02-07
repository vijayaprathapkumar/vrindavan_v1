"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRefund = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const refundModels_1 = require("../../models/refund/refundModels");
const processRefund = async (req, res) => {
    const { user_id, amount, date, refund_reason } = req.body;
    try {
        // Fetch the current wallet balance
        const balanceResult = await (0, refundModels_1.getWalletBalance)(user_id);
        if (!balanceResult || balanceResult.length === 0) {
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "User wallet not found"));
        }
        const currentBalance = Number(balanceResult[0].balance);
        // Calculate after balance
        const afterBalance = currentBalance + Number(amount);
        // Update the wallet balance
        await (0, refundModels_1.updateWalletBalance)(user_id, Number(amount));
        // Log the refund transaction
        const logDescription = `Refunded ₹${Number(amount).toFixed(2)} (${refund_reason}) | Wallet balance: ₹${afterBalance.toFixed(2)}`;
        await (0, refundModels_1.insertWalletLog)(user_id, date, currentBalance, amount, afterBalance, logDescription);
        // Return a success response
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Refund processed successfully", {
            user_id,
            amount,
            date,
            refund_reason,
        }));
    }
    catch (error) {
        console.error("Error processing refund:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Error processing refund"));
    }
};
exports.processRefund = processRefund;
