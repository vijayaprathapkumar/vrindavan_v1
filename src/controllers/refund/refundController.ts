import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  getWalletBalance,
  insertWalletLog,
  updateWalletBalance,
} from "../../models/refund/refundModels";

export const processRefund = async (req: Request, res: Response) => {
  const { user_id, amount, date, refund_reason } = req.body;

  try {
    // Fetch the current wallet balance
    const balanceResult = await getWalletBalance(user_id);

    if (!balanceResult || balanceResult.length === 0) {
      return res.status(400).json(createResponse(400, "User wallet not found"));
    }

    const currentBalance = Number(balanceResult[0].balance);

    // Check if the wallet has sufficient balance
    if (currentBalance < amount) {
      return res
        .status(400)
        .json(createResponse(400, "Insufficient wallet balance for refund"));
    }

    // Update the wallet balance
    await updateWalletBalance(user_id, +amount);

    // Log the refund transaction
    const afterBalance = currentBalance + amount;
    const logDescription = `Refunded ₹${amount.toFixed(
      2
    )} (${refund_reason}) | Wallet balance: ₹${afterBalance.toFixed(2)}`;

    await insertWalletLog(
      user_id,
      date,
      currentBalance,
      amount,
      afterBalance,
      logDescription
    );

    // Return a success response
    return res.status(200).json(
      createResponse(200, "Refund processed successfully", {
        user_id,
        amount,
        date,
        refund_reason,
      })
    );
  } catch (error) {
    console.error("Error processing refund:", error);
    return res.status(500).json(createResponse(500, "Error processing refund"));
  }
};
