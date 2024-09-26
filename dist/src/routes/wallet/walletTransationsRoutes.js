"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletTransactionsController_1 = require("../../controllers/wallet/walletTransactionsController");
const walletBalanceController_1 = require("../../controllers/wallet/walletBalanceController");
const billingHistoryController_1 = require("../../controllers/wallet/billingHistoryController");
const router = (0, express_1.Router)();
router.post("/transaction", walletTransactionsController_1.walletRecharges);
router.get("/transaction/:userId", walletTransactionsController_1.getTransactionsByUserId);
router.get("/balance/:userId", walletBalanceController_1.getWalletBalance);
router.get("/billing_history/:userId", billingHistoryController_1.fetchBillingHistory);
exports.default = router;