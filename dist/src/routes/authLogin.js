"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes /login.tsx
const express_1 = __importDefault(require("express"));
const authLogin_1 = require("../controllers/authLogin");
const router = express_1.default.Router();
router.post('/request-otp', authLogin_1.requestOTP);
router.post('/verify-otp', authLogin_1.verifyOTP);
exports.default = router;
