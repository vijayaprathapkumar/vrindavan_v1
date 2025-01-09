import { Router } from "express";
import { walletRecharges, getTransactionsByUserId, getAllTransactions, deductWalletBalance } from "../../controllers/wallet/walletTransactionsController";
import { getWalletBalance, getWalletBalanceWithOutUserId, getWalletLogs } from "../../controllers/wallet/walletBalanceController";
import {  fetchOrderBillingHistory, fetchOrderBillingHistoryForMobile } from "../../controllers/wallet/billingHistoryController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { processRefund } from "../../controllers/refund/refundController";

const router = Router();

router.post("/transaction",verifyDeviceToken, walletRecharges); 
router.get("/transaction/:userId",verifyDeviceToken, getTransactionsByUserId);  
router.get("/transactions", verifyDeviceToken, getAllTransactions);
router.get("/balance/:userId",verifyDeviceToken,getWalletBalance );
router.get("/balance", verifyDeviceToken, getWalletBalanceWithOutUserId);
router.get("/billing_history/:userId",verifyDeviceToken, fetchOrderBillingHistoryForMobile);
router.get("/billing_history/:userId",verifyDeviceToken, fetchOrderBillingHistory);
router.post("/deduct",verifyDeviceToken, deductWalletBalance);
router.get("/logs/:userId", verifyDeviceToken, getWalletLogs);
router.post("/refund", verifyDeviceToken, processRefund);

export default router;


