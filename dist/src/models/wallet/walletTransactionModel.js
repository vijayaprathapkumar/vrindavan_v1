"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsByUserId = exports.updateWalletBalance = exports.insertWalletTransaction = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const insertWalletTransaction = (transaction) => {
    const query = `
        INSERT INTO wallet_transactions 
        (transaction_id, rp_payment_id, rp_order_id, user_id, plan_id, transaction_date, extra_percentage, plan_amount, extra_amount, transaction_amount, transaction_type, status, description, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(query, [
            transaction.transaction_id,
            transaction.rp_payment_id,
            transaction.rp_order_id,
            transaction.user_id,
            transaction.plan_id,
            transaction.transaction_date,
            transaction.extra_percentage,
            transaction.plan_amount,
            transaction.extra_amount,
            transaction.transaction_amount,
            transaction.transaction_type,
            transaction.status,
            transaction.description,
        ], (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};
exports.insertWalletTransaction = insertWalletTransaction;
const updateWalletBalance = async (userId, amount) => {
    const checkQuery = `SELECT * FROM wallet_balances WHERE user_id = ?`;
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(checkQuery, [userId], (err, results) => {
            if (err) {
                return reject(err);
            }
            if (results.length > 0) {
                // User exists, update the balance and updated_at timestamp
                const updateQuery = `
                    UPDATE wallet_balances
                    SET balance = balance + ?, updated_at = NOW()
                    WHERE user_id = ?
                `;
                databaseConnection_1.db.query(updateQuery, [amount, userId], (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
            else {
                // User doesn't exist, insert a new wallet balance record with created_at and updated_at
                const insertQuery = `
                    INSERT INTO wallet_balances (user_id, balance, created_at, updated_at)
                    VALUES (?, ?, NOW(), NOW())
                `;
                databaseConnection_1.db.query(insertQuery, [userId, amount], (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            }
        });
    });
};
exports.updateWalletBalance = updateWalletBalance;
const getTransactionsByUserId = (userId, page, limit) => {
    const offset = (page - 1) * limit;
    const query = `
        SELECT * FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY updated_at DESC 
        LIMIT ? OFFSET ?
    `;
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(query, [userId, limit, offset], (err, results) => {
            if (err) {
                return reject(err);
            }
            const transactions = results;
            const countQuery = `SELECT COUNT(*) AS total FROM wallet_transactions WHERE user_id = ?`;
            databaseConnection_1.db.query(countQuery, [userId], (err, countResults) => {
                if (err) {
                    return reject(err);
                }
                const total = countResults[0]?.total || 0;
                resolve({ transactions, total });
            });
        });
    });
};
exports.getTransactionsByUserId = getTransactionsByUserId;
