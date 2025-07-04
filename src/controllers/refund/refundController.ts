import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  createWalletBalance,
  getWalletBalance,
  insertWalletLog,
  updateWalletBalance,
} from "../../models/refund/refundModels";

export const processRefund = async (req: Request, res: Response) => {
  const { user_id, amount, date, refund_reason } = req.body;

  try {
    // Fetch the current wallet balance
      let currentBalance = 0;
    const balanceResult = await getWalletBalance(user_id);

    if (!balanceResult || balanceResult.length === 0) {
      // Create new wallet balance record with 0 balance
      await createWalletBalance(user_id);
      currentBalance = 0;
    } else {
      currentBalance = Number(balanceResult[0].balance);
    }



    // Calculate after balance
    const afterBalance = currentBalance + Number(amount);

    // Update the wallet balance
    await updateWalletBalance(user_id, Number(amount));

    // Log the refund transaction
    const logDescription = `Refunded ₹${Number(amount).toFixed(
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
