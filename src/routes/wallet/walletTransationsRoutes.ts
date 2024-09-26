import { Router } from "express";
import { walletRecharges, getTransactionsByUserId } from "../../controllers/wallet/walletTransactionsController";
import { getWalletBalance } from "../../controllers/wallet/walletBalanceController";
import { fetchBillingHistory } from "../../controllers/wallet/billingHistoryController";

const router = Router();

router.post("/transaction", walletRecharges); 
router.get("/transaction/:userId", getTransactionsByUserId);  
router.get("/balance/:userId",getWalletBalance );
router.get("/billing_history/:userId", fetchBillingHistory);
export default router;


