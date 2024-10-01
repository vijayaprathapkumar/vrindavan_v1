"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDeviceToken = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const verifyDeviceToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 401, message: "Authorization header is required." });
    }
    const token = authHeader.split(' ')[1];
    try {
        const sql = `
      SELECT * FROM user_one_time_passwords 
      WHERE device_token = ?;
    `;
        const [rows] = await databaseConnection_1.db.promise().query(sql, [token]);
        if (rows.length === 0) {
            return res.status(401).json({ status: 401, message: "Invalid device token." });
        }
        next();
    }
    catch (error) {
        console.error("Error verifying device token:", error);
        res.status(500).json({ status: 500, message: "Internal server error." });
    }
};
exports.verifyDeviceToken = verifyDeviceToken;
