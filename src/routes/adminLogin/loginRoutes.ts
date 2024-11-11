import express from "express";
import { adminVerifyController } from "../../controllers/adminLogin/loginController";

const router = express.Router();

// Admin Verify OTP
router.post("/login", adminVerifyController);

export default router;
