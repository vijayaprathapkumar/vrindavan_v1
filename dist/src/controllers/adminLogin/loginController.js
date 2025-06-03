"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminVerifyController = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const loginModel_1 = require("../../models/adminLogin/loginModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const regex_1 = require("../../config/regex/regex");
dotenv_1.default.config();
// verify admin login
const adminVerifyController = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Email and password are required"));
    }
    if (!(0, regex_1.validateEmailRegex)(email)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid email format"));
    }
    if (!(0, regex_1.validatePassword)(password)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Password must not be empty"));
    }
    try {
        const userRecord = await (0, loginModel_1.adminVerify)(email, password);
        if (!userRecord) {
            return res.status(401).json((0, responseHandler_1.createResponse)(401, "Invalid credentials"));
        }
        let apiToken = userRecord.device_token;
        if (!apiToken) {
            apiToken = generateApiToken(userRecord.id, userRecord.email);
            await (0, loginModel_1.updateApiToken)(userRecord.id, apiToken);
        }
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Login successful", {
            user: userRecord,
        }));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Internal server error"));
    }
};
exports.adminVerifyController = adminVerifyController;
const generateApiToken = (userId, email) => {
    return jsonwebtoken_1.default.sign({ id: userId, email }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
    });
};
