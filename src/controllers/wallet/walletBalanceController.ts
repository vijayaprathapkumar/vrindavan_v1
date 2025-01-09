import { Request, Response } from "express";
import {
  getWalletBalanceByUserId,
  getWalletBalanceByWithOutUserId,
  getWalletLogsWithFoodDetails,
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


export const getWalletLogs = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    // Fetch wallet logs with food details
    const walletLogsWithFood = await getWalletLogsWithFoodDetails(userId, page, limit);

    // Handle case where no wallet logs are found
    if (!walletLogsWithFood || walletLogsWithFood.length === 0) {
      return res
        .status(404)
        .json(createResponse(404, 'No wallet logs found for this user'));
    }

    const totalCount = walletLogsWithFood.length;
    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      walletLogs: walletLogsWithFood,
      page,
      limit,
      totalCount,
      totalPages,
    };

    return res
      .status(200)
      .json(createResponse(200, 'Wallet logs retrieved successfully', response));
  } catch (error) {
    console.error("Error fetching wallet logs:", error.message);
    return res
      .status(500)
      .json(createResponse(500, 'Internal Server Error', error.message));
  }
};
