import express from "express";
import { checkOrderStatus } from "../../controllers/orderStatus/orderStatusController";

const router = express.Router();

router.get("/", checkOrderStatus);

export default router;
