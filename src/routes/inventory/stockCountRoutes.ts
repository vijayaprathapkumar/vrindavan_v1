import express from "express";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { getStockSummary } from "../../controllers/inventory/stockCountController";

const router = express.Router();

router.get("/", verifyDeviceToken, getStockSummary);

export default router;
