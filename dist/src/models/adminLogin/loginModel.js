"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApiToken = exports.adminVerify = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const databaseConnection_1 = require("../../config/databaseConnection");
const adminVerify = async (email, password) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await databaseConnection_1.db.promise().query(sql, [email]);
    if (rows.length === 0)
        return null;
    const userRecord = rows[0];
    const passwordHash = userRecord.password.replace(/^\$2y\$/, "$2b$");
    const isPasswordMatch = await bcrypt_1.default.compare(password, passwordHash);
    if (isPasswordMatch) {
        return userRecord ? userRecord : null;
    }
    return null;
};
exports.adminVerify = adminVerify;
const updateApiToken = async (userId, apiToken) => {
    const sql = `UPDATE users SET device_token = ? WHERE id = ?`;
    await databaseConnection_1.db.promise().query(sql, [apiToken, userId]);
};
exports.updateApiToken = updateApiToken;
