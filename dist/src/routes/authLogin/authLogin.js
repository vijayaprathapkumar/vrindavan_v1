"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authLogin_1 = require("../../controllers/authLogin/authLogin");
const authValidation_1 = require("../../validation/auth/authValidation");
const router = express_1.default.Router();
router.post("/request-otp", authValidation_1.requestOTPValidation, authValidation_1.validate, authLogin_1.requestOTP);
router.post("/verify-otp", authValidation_1.verifyOTPValidation, authValidation_1.validate, authLogin_1.verifyOTP);
exports.default = router;
