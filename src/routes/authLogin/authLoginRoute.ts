import express from "express";
import { requestOtp, verifyOtp } from "../../controllers/authLogin/authLoginController";

const router = express.Router();

// Request OTP
router.post("/request-otp", requestOtp);

// Verify OTP
router.post("/verify-otp", verifyOtp);

export default router;
