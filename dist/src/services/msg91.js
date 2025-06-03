"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = exports.generateOTP = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const sendOTP = async (mobile_number, otp) => {
    const authKey = "155086Aw0IlR8NVh61488ba1P1";
    const senderId = "VRINDF";
    const route = "4";
    const templateId = "614885f059845876377d5114";
    const url = `https://api.msg91.com/api/v5/otp`;
    const params = {
        mobile: mobile_number,
        otp: otp,
        authkey: authKey,
        sender: senderId,
        route: route,
        template_id: templateId,
    };
    try {
        await axios_1.default.post(url, null, { params });
    }
    catch (error) {
        throw new Error("Error sending OTP. Please try again.");
    }
};
exports.sendOTP = sendOTP;
