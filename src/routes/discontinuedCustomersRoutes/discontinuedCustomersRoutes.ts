import express from "express";
import { verifyDeviceToken } from "../../middlewares/authMiddleware"; 
import { fetchDiscontinuedCustomers } from "../../controllers/discontinuedCustomersController/discontinuedCustomersController";

const router = express.Router();

// Route for fetching discontinued customers
router.get("/", verifyDeviceToken, fetchDiscontinuedCustomers);

export default router;
