import express from "express";
import { requestOTP, verifyOTP } from "../../controllers/authLogin/authLoginController";
import {
  requestOTPValidation,
  verifyOTPValidation,
  validate,
} from "../../validation/auth/authValidation";

const router = express.Router();

router.post("/request-otp", requestOTPValidation, validate, requestOTP);
router.post("/verify-otp", verifyOTPValidation, validate, verifyOTP);

export default router;
