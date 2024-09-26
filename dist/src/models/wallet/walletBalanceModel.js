"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletBalanceByUserId = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getWalletBalanceByUserId = (userId) => {
    const query = `
        SELECT user_id, balance, created_at, updated_at
        FROM wallet_balances
        WHERE user_id = ?
    `;
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(query, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (!results || results.length === 0) {
                return resolve(null);
            }
            const result = results[0];
            const walletBalance = {
                user_id: result.user_id,
                balance: parseFloat(result.balance),
                created_at: result.created_at,
                updated_at: result.updated_at,
            };
            resolve(walletBalance);
        });
    });
};
exports.getWalletBalanceByUserId = getWalletBalanceByUserId;
