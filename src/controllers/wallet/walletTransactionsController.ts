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
import axios from "axios";
import { db } from "../../config/databaseConnection";

const razorpayKeyId = process.env.RAZORPAY_KEY_ID!;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET!;

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
    description,
  } = req.body;

  // Start database transaction
  const connection = await db.promise().getConnection();
  await connection.beginTransaction();

  try {
    // 1. Check for duplicate payment (double verification)
    const [existing]: any = await connection.query(
      `SELECT id FROM wallet_transactions WHERE rp_payment_id = ? LIMIT 1`,
      [rp_payment_id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(200).json(
        createResponse(200, "Transaction already processed", {
          transaction_id,
          user_id,
          plan_amount,
          extra_percentage,
          transaction_amount,
          status: "success",
          is_duplicate: true,
        })
      );
    }

    // 2. Verify Razorpay payment details
    const paymentCheck = await axios.get(
      `https://api.razorpay.com/v1/payments/${rp_payment_id}`,
      {
        auth: {
          username: razorpayKeyId,
          password: razorpayKeySecret,
        },
      }
    );

    const paymentInfo = paymentCheck.data;

    if (!paymentInfo || paymentInfo.status === "failed") {
      await connection.rollback();
      return res.status(400).json(
        createResponse(400, "Invalid or failed payment ID", {
          status: "failed",
        })
      );
    }

    // 3. Capture payment if authorized
    let captureData: any = null;

    if (paymentInfo.status === "authorized") {
      const captureResponse = await axios.post(
        `https://api.razorpay.com/v1/payments/${rp_payment_id}/capture`,
        new URLSearchParams({
          amount: (transaction_amount * 100).toString(),
        }),
        {
          auth: {
            username: razorpayKeyId,
            password: razorpayKeySecret,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      captureData = captureResponse.data;

      if (captureData.status !== "captured") {
        await connection.rollback();
        return res.status(400).json(
          createResponse(400, "Payment capture failed", {
            status: "failed",
          })
        );
      }
    } else if (paymentInfo.status !== "captured") {
      await connection.rollback();
      return res.status(400).json(
        createResponse(
          400,
          `Cannot process payment in '${paymentInfo.status}' status`,
          {
            status: "failed",
          }
        )
      );
    }
    

    // 4. Update wallet balance
    await updateWalletBalance(connection, user_id, transaction_amount);


    // 5. Insert wallet transaction record
    const isPaymentSuccessful =
      paymentInfo.status === "captured" || captureData?.status === "captured";

    await insertWalletTransaction(connection, {
      transaction_id: Number(transaction_id),
      rp_payment_id,
      rp_order_id,
      user_id,
      plan_id,
      extra_percentage,
      plan_amount,
      extra_amount,
      transaction_amount,
      transaction_type,
      status: isPaymentSuccessful ? "success" : "failed",
      description,
    });

    // 6. Get updated balance
    const [balanceResult]: any = await connection.query(
      `SELECT balance FROM wallet_balances WHERE user_id = ?`,
      [user_id]
    );

    const newBalance = Number(balanceResult?.[0]?.balance || 0);

    // 7. Insert wallet log
    const logDescription = `₹${transaction_amount.toFixed(
      2
    )} Recharged for Wallet.`;

    await insertWalletLog(connection, {
      user_id,
      order_id: Number(transaction_id),
      order_date: new Date(),
      before_balance: newBalance - transaction_amount,
      amount: transaction_amount,
      after_balance: newBalance,
      wallet_type: "recharge",
      description: logDescription,
    });

    // Commit transaction
    await connection.commit();

    // Final success response
    return res.status(200).json(
      createResponse(200, "Transaction processed successfully", {
        transaction_id,
        user_id,
        plan_amount,
        extra_percentage,
        transaction_amount,
        status: "success",
      })
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("Recharge error:", error?.response?.data || error.message);
    return res.status(500).json(
      createResponse(500, "Recharge failed", {
        transaction_id,
        user_id,
        plan_amount,
        extra_percentage,
        transaction_amount,
        status: "failed",
        error: error?.response?.data || error.message,
      })
    );
  } finally {
    connection.release();
  }
};

export const getTransactionsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;

  try {
    const { transactions, total }: TransactionsResponse =
      await fetchTransactionsByUserId(userId, Number(page), Number(limit));

    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).json(
      createResponse(200, "Transactions retrieved successfully", {
        transactions,
        totalCount: total,
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
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = (req.query.searchTerm as string) || "";
  const startDate = (req.query.startDate as string) || null;
  const endDate = (req.query.endDate as string) || null;

  try {
    const { transactions, total }: TransactionsResponse =
      await fetchAllTransactions(
        Number(page),
        Number(limit),
        startDate as string | undefined,
        endDate as string | undefined,
        searchTerm as string | undefined
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
