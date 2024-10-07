import { Router } from "express";
import { walletRecharges, getTransactionsByUserId } from "../../controllers/wallet/walletTransactionsController";
import { getWalletBalance } from "../../controllers/wallet/walletBalanceController";
import { fetchBillingHistory } from "../../controllers/wallet/billingHistoryController";
import { verifyDeviceToken } from "../../middlewares/authMiddleware";

const router = Router();

router.post("/transaction",verifyDeviceToken, walletRecharges); 
router.get("/transaction/:userId",verifyDeviceToken, getTransactionsByUserId);  
router.get("/balance/:userId",verifyDeviceToken,getWalletBalance );
router.get("/billing_history/:userId",verifyDeviceToken, fetchBillingHistory);
export default router;


