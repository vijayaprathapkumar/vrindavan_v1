"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authLoginController_1 = require("../../controllers/authLogin/authLoginController");
const router = express_1.default.Router();
// Request OTP
router.post("/request-otp", authLoginController_1.requestOtp);
// Verify OTP
router.post("/verify-otp", authLoginController_1.verifyOtp);
exports.default = router;
