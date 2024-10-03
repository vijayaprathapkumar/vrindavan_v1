"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentsController_1 = require("../../controllers/payments/paymentsController");
const router = express_1.default.Router();
router.get("/:userId", paymentsController_1.fetchPayments);
router.post("/", paymentsController_1.addPaymentController);
router.put("/:id", paymentsController_1.updatePaymentController);
router.delete("/:id", paymentsController_1.removePayment);
exports.default = router;
