"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeviceToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.Token_SECRET_KEY;
const generateToken = (mobile_number, device_token) => {
    const payload = { mobile_number, device_token };
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, { expiresIn: '10m' });
};
exports.generateToken = generateToken;
const generateDeviceToken = () => {
    const length = 138;
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generateRandomString = (length) => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };
    const randomString = generateRandomString(length);
    return randomString;
};
exports.generateDeviceToken = generateDeviceToken;
