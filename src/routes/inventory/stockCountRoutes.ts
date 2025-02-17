import express from "express";

import { verifyDeviceToken } from "../../middlewares/authMiddleware";
import { getStockCount } from "../../controllers/inventory/stockCountController";

const router = express.Router();

router.get("/", verifyDeviceToken, getStockCount);

export default router;
