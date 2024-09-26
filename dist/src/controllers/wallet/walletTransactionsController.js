"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsByUserId = exports.walletRecharges = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const walletTransactionModel_1 = require("../../models/wallet/walletTransactionModel");
const walletRecharges = async (req, res) => {
    const { transaction_id, rp_payment_id, rp_order_id, user_id, plan_id, transaction_date, extra_percentage, plan_amount, extra_amount, transaction_amount, transaction_type, status, description, } = req.body;
    try {
        await (0, walletTransactionModel_1.insertWalletTransaction)({
            transaction_id,
            rp_payment_id,
            rp_order_id,
            user_id,
            plan_id,
            transaction_date,
            extra_percentage,
            plan_amount,
            extra_amount,
            transaction_amount,
            transaction_type,
            status,
            description,
        });
        await (0, walletTransactionModel_1.updateWalletBalance)(user_id, transaction_amount);
        return res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Transaction stored successfully", {
            transaction_id,
            user_id,
            plan_amount,
            extra_percentage,
            transaction_amount,
            status
        }));
    }
    catch (error) {
        console.error("Error processing wallet recharge:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error processing wallet recharge"));
    }
};
exports.walletRecharges = walletRecharges;
const getTransactionsByUserId = async (req, res) => {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;
    try {
        const { transactions, total } = await (0, walletTransactionModel_1.getTransactionsByUserId)(userId, Number(page), Number(limit));
        const totalPages = Math.ceil(total / Number(limit));
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Transactions retrieved successfully", {
            transactions,
            totalRecord: total,
            currentPage: Number(page),
            limit: Number(limit),
            totalPages,
        }));
    }
    catch (error) {
        console.error("Error retrieving transactions:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error retrieving transactions"));
    }
};
exports.getTransactionsByUserId = getTransactionsByUserId;
