import express from "express";
import {
  fetchPayments,
  addPaymentController,
  updatePaymentController,
  removePayment,
} from "../../controllers/payments/paymentsController";

const router = express.Router();

router.get("/:userId", fetchPayments);
router.post("/", addPaymentController);
router.put("/:id", updatePaymentController);
router.delete("/:id", removePayment);

export default router;
