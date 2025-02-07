"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertWalletLog = exports.updateWalletBalance = exports.getWalletBalance = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getWalletBalance = async (userId) => {
    const query = `SELECT balance FROM wallet_balances WHERE user_id = ?`;
    const [result] = await databaseConnection_1.db.promise().query(query, [userId]);
    return result;
};
exports.getWalletBalance = getWalletBalance;
const updateWalletBalance = async (userId, amount) => {
    const query = `
    UPDATE wallet_balances
    SET balance = balance + ?, updated_at = NOW()
    WHERE user_id = ?
  `;
    await databaseConnection_1.db.promise().query(query, [amount, userId]);
};
exports.updateWalletBalance = updateWalletBalance;
const insertWalletLog = async (userId, orderDate, beforeBalance, amount, afterBalance, description) => {
    const query = `
    INSERT INTO wallet_logs 
    (user_id, order_id, order_date, before_balance, amount, after_balance, wallet_type, description, created_at, updated_at)
    VALUES (?, NULL, ?, ?, ?, ?, 'refund', ?, NOW(), NOW())
  `;
    await databaseConnection_1.db.promise().query(query, [
        userId,
        orderDate,
        beforeBalance,
        amount,
        afterBalance,
        description,
    ]);
};
exports.insertWalletLog = insertWalletLog;
