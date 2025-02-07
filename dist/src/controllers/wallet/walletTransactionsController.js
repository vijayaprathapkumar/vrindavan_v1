"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductWalletBalance = exports.getAllTransactions = exports.getTransactionsByUserId = exports.walletRecharges = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const walletTransactionModel_1 = require("../../models/wallet/walletTransactionModel");
const databaseConnection_1 = require("../../config/databaseConnection");
const walletRecharges = async (req, res) => {
    const { transaction_id, rp_payment_id, rp_order_id, user_id, plan_id, extra_percentage, plan_amount, extra_amount, transaction_amount, transaction_type, status, description, } = req.body;
    try {
        await (0, walletTransactionModel_1.updateWalletBalance)(user_id, transaction_amount);
        await (0, walletTransactionModel_1.insertWalletTransaction)({
            transaction_id,
            rp_payment_id,
            rp_order_id,
            user_id,
            plan_id,
            extra_percentage,
            plan_amount,
            extra_amount,
            transaction_amount,
            transaction_type,
            status,
            description,
        });
        const balanceQuery = `SELECT balance FROM wallet_balances WHERE user_id = ?`;
        const [balanceResult] = await databaseConnection_1.db
            .promise()
            .query(balanceQuery, [user_id]);
        if (balanceResult.length === 0) {
            throw new Error("Balance not found after update");
        }
        const newBalance = Number(balanceResult[0].balance);
        const logDescription = `₹${transaction_amount.toFixed(2)} Recharged for Wallet.`;
        await (0, walletTransactionModel_1.insertWalletLog)({
            user_id,
            order_id: transaction_id,
            order_date: new Date(),
            before_balance: newBalance - transaction_amount,
            amount: transaction_amount,
            after_balance: newBalance,
            wallet_type: "recharge",
            description: logDescription,
        });
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Transaction stored successfully", {
            transaction_id,
            user_id,
            plan_amount,
            extra_percentage,
            transaction_amount,
            status,
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
const getAllTransactions = async (req, res) => {
    const { page = 1, limit = 10, startDate, endDate, searchTerm, sortField, sortOrder, } = req.query;
    try {
        const { transactions, total } = await (0, walletTransactionModel_1.fetchAllTransactions)(Number(page), Number(limit), startDate, endDate, searchTerm, sortField, sortOrder);
        const totalPages = Math.ceil(total / Number(limit));
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Transactions retrieved successfully", {
            transactions,
            totalCount: total,
            currentPage: page,
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
exports.getAllTransactions = getAllTransactions;
const deductWalletBalance = async (req, res) => {
    const { userId, deductionAmount, reason, walletType, order_date } = req.body;
    try {
        const currentBalanceQuery = "SELECT balance FROM wallet_balances WHERE user_id = ?";
        const [currentBalanceResult] = await databaseConnection_1.db
            .promise()
            .query(currentBalanceQuery, [userId]);
        if (currentBalanceResult.length === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "User not found in wallet_balances"));
        }
        const currentBalance = currentBalanceResult[0]?.balance || 0;
        const newBalance = currentBalance - deductionAmount;
        if (newBalance < 0) {
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "Insufficient balance"));
        }
        await (0, walletTransactionModel_1.updateWalletBalanceDections)(userId, -deductionAmount);
        await (0, walletTransactionModel_1.insertWalletLog)({
            user_id: userId,
            order_id: null,
            order_date: order_date,
            before_balance: currentBalance,
            amount: deductionAmount,
            after_balance: newBalance,
            wallet_type: walletType,
            description: reason,
        });
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Wallet balance deducted successfully", {
            userId,
            deductionAmount,
            before_balance: currentBalance,
            after_balance: newBalance,
        }));
    }
    catch (error) {
        console.error("Error deducting wallet balance:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error deducting wallet balance", error.message));
    }
};
exports.deductWalletBalance = deductWalletBalance;
