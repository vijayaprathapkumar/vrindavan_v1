import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  insertWalletTransaction,
  updateWalletBalance,
  getTransactionsByUserId as fetchTransactionsByUserId,
  TransactionsResponse,
  fetchAllTransactions,
} from "../../models/wallet/walletTransactionModel";

export const walletRecharges = async (req: Request, res: Response) => {
  const {
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
  } = req.body;

  try {
    await updateWalletBalance(user_id, transaction_amount);

    await insertWalletTransaction({
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
  const { page = 1, limit = 10 } = req.query;

  try {
    const { transactions, total }: TransactionsResponse =
      await fetchAllTransactions(Number(page), Number(limit));
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
