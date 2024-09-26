import { Request, Response } from "express";
import { getWalletBalanceByUserId, WalletBalance } from "../../models/wallet/walletBalanceModel"; 
import { createResponse } from "../../utils/responseHandler";

export const getWalletBalance = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const walletBalance: WalletBalance | null = await getWalletBalanceByUserId(userId);

        if (!walletBalance) {
            return res.status(404).json(createResponse(404, "User not found"));
        }


        const balance = walletBalance.balance;

        return res.status(200).json(createResponse(200, "Wallet balance retrieved successfully", { walletBalance: { ...walletBalance, balance } }));
    } catch (error) {
        console.error("Error retrieving wallet balance:", error);
        return res.status(500).json(createResponse(500, "Error retrieving wallet balance"));
    }
};
