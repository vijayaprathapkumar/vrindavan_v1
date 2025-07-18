import { Router } from "express";
import { walletRecharges, getTransactionsByUserId, getAllTransactions, deductWalletBalance } from "../../controllers/wallet/walletTransactionsController";
import { getRefundDeductionLogsAdmin, getWalletBalance, getWalletBalanceByUserIdAdmin, getWalletBalanceWithOutUserId, getWalletLogs, getWalletLogsAdmin } from "../../controllers/wallet/walletBalanceController";
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
router.get("/log/:userId", verifyDeviceToken, getWalletLogsAdmin);
router.get("/logs/:userId", verifyDeviceToken, getWalletLogs);
router.get("/refund_deduction_logs", verifyDeviceToken, getRefundDeductionLogsAdmin);
router.post("/refund", verifyDeviceToken, processRefund);
router.get("/balances/:userId",verifyDeviceToken,getWalletBalanceByUserIdAdmin );


export default router;


