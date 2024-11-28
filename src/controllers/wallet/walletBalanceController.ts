import { Request, Response } from "express";
import {
  getWalletBalanceByUserId,
  getWalletBalanceByWithOutUserId,
  WalletBalance,
} from "../../models/wallet/walletBalanceModel";
import { createResponse } from "../../utils/responseHandler";

export const getWalletBalance = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const walletBalance: WalletBalance | null = await getWalletBalanceByUserId(
      userId
    );

    if (!walletBalance) {
      return res.status(404).json(createResponse(404, "User not found"));
    }

    const balance = walletBalance.balance;
    const response = { walletBalance: [{ ...walletBalance, balance }] };

    return res
      .status(200)
      .json(
        createResponse(200, "Wallet balance retrieved successfully", response)
      );
  } catch (error) {
    console.error("Error retrieving wallet balance:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "Error retrieving wallet balance", error.message)
      );
  }
};

//without UserId

export const getWalletBalanceWithOutUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const searchTerm = req.query.searchTerm as string | undefined;

    const { walletBalances, totalCount } =
      await getWalletBalanceByWithOutUserId(
        page,
        limit,
        startDate,
        endDate,
        searchTerm
      );

    if (!walletBalances || walletBalances.length === 0) {
      return res
        .status(404)
        .json(createResponse(404, "No wallet balances found"));
    }

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      walletBalances,
      page,
      limit,
      totalCount,
      totalPages,
    };

    return res
      .status(200)
      .json(
        createResponse(200, "Wallet balances retrieved successfully", response)
      );
  } catch (error) {
    console.error("Error retrieving wallet balance:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "Error retrieving wallet balance", error.message)
      );
  }
};
