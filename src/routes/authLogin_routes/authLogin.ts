import express from "express";
import {
  requestOTP,
  verifyOTP,
} from "../../controllers/authLogin_controllers/authLogin";
import {
  requestOTPValidation,
  verifyOTPValidation,
  validate,
} from "../../validation/authValidation/authValidation";

const router = express.Router();

router.post("/request-otp", requestOTPValidation, validate, requestOTP);
router.post("/verify-otp", verifyOTPValidation, validate, verifyOTP);

export default router;
