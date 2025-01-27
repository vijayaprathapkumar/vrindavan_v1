import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  insertWalletTransaction,
  updateWalletBalance,
  getTransactionsByUserId as fetchTransactionsByUserId,
  TransactionsResponse,
  fetchAllTransactions,
  updateWalletBalanceDections,
  insertWalletLog,
} from "../../models/wallet/walletTransactionModel";
import { db } from "../../config/databaseConnection";

export const walletRecharges = async (req: Request, res: Response) => {
  const {
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
  } = req.body;

  try {
    await updateWalletBalance(user_id, transaction_amount);

    await insertWalletTransaction({
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
    const [balanceResult]: any = await db
      .promise()
      .query(balanceQuery, [user_id]);

    if (balanceResult.length === 0) {
      throw new Error("Balance not found after update");
    }

    const newBalance = Number(balanceResult[0].balance);

    const logDescription = `₹${transaction_amount.toFixed(
      2
    )} Recharged for Wallet.`;
    await insertWalletLog({
      user_id,
      order_id: transaction_id,
      order_date: new Date(),
      before_balance: newBalance - transaction_amount,
      amount: transaction_amount,
      after_balance: newBalance,
      wallet_type: "recharge",
      description: logDescription,
    });

    return res.status(200).json(
      createResponse(200, "Transaction stored successfully", {
        transaction_id,
        user_id,
        plan_amount,
        extra_percentage,
        transaction_amount,
        status,
      })
    );
  } catch (error) {
    console.error("Error processing wallet recharge:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error processing wallet recharge"));
  }
};

export const getTransactionsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const { page = 1, limit = 10 } = req.query;

  try {
    const { transactions, total }: TransactionsResponse =
      await fetchTransactionsByUserId(userId, Number(page), Number(limit));

    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).json(
      createResponse(200, "Transactions retrieved successfully", {
        transactions,
        totalRecord: total,
        currentPage: Number(page),
        limit: Number(limit),
        totalPages,
      })
    );
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error retrieving transactions"));
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    startDate,
    endDate,
    searchTerm,
    sortField,
    sortOrder,
  } = req.query;

  try {
    const { transactions, total }: TransactionsResponse =
      await fetchAllTransactions(
        Number(page),
        Number(limit),
        startDate as string | undefined,
        endDate as string | undefined,
        searchTerm as string | undefined,
        sortField as string | undefined,
        sortOrder as string | undefined
      );
    const totalPages = Math.ceil(total / Number(limit));
    return res.status(200).json(
      createResponse(200, "Transactions retrieved successfully", {
        transactions,
        totalCount: total,
        currentPage: page,
        limit: Number(limit),
        totalPages,
      })
    );
  } catch (error) {
    console.error("Error retrieving transactions:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error retrieving transactions"));
  }
};

export const deductWalletBalance = async (req: Request, res: Response) => {
  const { userId, deductionAmount, reason, walletType, order_date } = req.body;

  try {
    const currentBalanceQuery =
      "SELECT balance FROM wallet_balances WHERE user_id = ?";
    const [currentBalanceResult]: any = await db
      .promise()
      .query(currentBalanceQuery, [userId]);

    if (currentBalanceResult.length === 0) {
      return res
        .status(404)
        .json(createResponse(404, "User not found in wallet_balances"));
    }

    const currentBalance = currentBalanceResult[0]?.balance || 0;
    const newBalance = currentBalance - deductionAmount;

    if (newBalance < 0) {
      return res.status(400).json(createResponse(400, "Insufficient balance"));
    }

    await updateWalletBalanceDections(userId, -deductionAmount);

    await insertWalletLog({
      user_id: userId,
      order_id: null,
      order_date: order_date,
      before_balance: currentBalance,
      amount: deductionAmount,
      after_balance: newBalance,
      wallet_type: walletType,
      description: reason,
    });

    return res.status(200).json(
      createResponse(200, "Wallet balance deducted successfully", {
        userId,
        deductionAmount,
        before_balance: currentBalance,
        after_balance: newBalance,
      })
    );
  } catch (error) {
    console.error("Error deducting wallet balance:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "Error deducting wallet balance", error.message)
      );
  }
};
