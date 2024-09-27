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
const generateToken = (mobile_number) => {
    const payload = { mobile_number };
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, { expiresIn: '10m' });
};
exports.generateToken = generateToken;
const generateDeviceToken = () => {
    const randomString = Math.random().toString(36).substring(2);
    const timestamp = Date.now().toString(36);
    const token = randomString + timestamp;
    return token.replace(/[^a-zA-Z0-9]/g, '0').padEnd(138, '0').substring(0, 138);
};
exports.generateDeviceToken = generateDeviceToken;
