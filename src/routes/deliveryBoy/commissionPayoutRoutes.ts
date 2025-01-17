import express from "express";
import { getCommissionPayouts } from "../../controllers/deliveryBoy/commissionPayoutController";

const router = express.Router();

router.get("/", getCommissionPayouts);

export default router;
