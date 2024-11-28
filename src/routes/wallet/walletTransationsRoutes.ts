import { Router } from "express";
import { walletRecharges, getTransactionsByUserId, getAllTransactions } from "../../controllers/wallet/walletTransactionsController";
import { getWalletBalance, getWalletBalanceWithOutUserId } from "../../controllers/wallet/walletBalanceController";
import {  fetchOrderBillingHistory, fetchOrderBillingHistoryForMobile } from "../../controllers/wallet/billingHistoryController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/transaction",verifyDeviceToken, walletRecharges); 
router.get("/transaction/:userId",verifyDeviceToken, getTransactionsByUserId);  
router.get("/transactions", verifyDeviceToken, getAllTransactions);
router.get("/balance/:userId",verifyDeviceToken,getWalletBalance );
router.get("/balance", verifyDeviceToken, getWalletBalanceWithOutUserId);
router.get("/billing_history/:userId",verifyDeviceToken, fetchOrderBillingHistoryForMobile);
router.get("/billing_history/:userId",verifyDeviceToken, fetchOrderBillingHistory);


export default router;


