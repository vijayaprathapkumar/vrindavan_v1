"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletBalanceDections = exports.insertWalletLog = exports.fetchAllTransactions = exports.getTransactionsByUserId = exports.updateWalletBalance = exports.insertWalletTransaction = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const insertWalletTransaction = (transaction) => {
    const generateTransactionId = () => {
        const prefix = "TXN";
        const userId = transaction.user_id;
        return `${prefix}${userId}`;
    };
    const query = `
        INSERT INTO wallet_transactions 
        (transaction_id, rp_payment_id, rp_order_id, user_id, plan_id, transaction_date, extra_percentage, plan_amount, extra_amount, transaction_amount, transaction_type, status, description, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const transactionId = generateTransactionId();
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(query, [
            transactionId,
            transaction.rp_payment_id,
            transaction.rp_order_id,
            transaction.user_id,
            transaction.plan_id,
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
    const [results] = await databaseConnection_1.db.promise().query(checkQuery, [userId]);
    if (results.length > 0) {
        const updateQuery = `
            UPDATE wallet_balances
            SET balance = balance + ?, updated_at = NOW()
            WHERE user_id = ?
        `;
        await databaseConnection_1.db.promise().query(updateQuery, [amount, userId]);
    }
    else {
        const insertQuery = `
            INSERT INTO wallet_balances (user_id, balance, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
        `;
        await databaseConnection_1.db.promise().query(insertQuery, [userId, amount]);
    }
};
exports.updateWalletBalance = updateWalletBalance;
const getTransactionsByUserId = (userId, page, limit) => {
    const offset = (page - 1) * limit;
    const query = `
    SELECT * FROM wallet_transactions
    WHERE user_id = ? AND status = 'success'
    ORDER BY updated_at DESC
    LIMIT ? OFFSET ?
  `;
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(query, [userId, limit, offset], (err, results) => {
            if (err) {
                return reject(err);
            }
            const transactions = results;
            const countQuery = `
        SELECT COUNT(*) AS total 
        FROM wallet_transactions 
        WHERE user_id = ? AND status = 'success'
      `;
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
const fetchAllTransactions = (page, limit, startDate, endDate, searchTerm, sortField, sortOrder) => {
    // Ensure valid fallback values
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const offset = (safePage - 1) * safeLimit;
    const whereClauses = [];
    const queryParams = [];
    if (startDate) {
        whereClauses.push("wt.updated_at >= ?");
        queryParams.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
        whereClauses.push("wt.updated_at <= ?");
        queryParams.push(`${endDate} 23:59:59`);
    }
    if (searchTerm) {
        let formattedSearchTerm = `%${searchTerm}%`;
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (dateRegex.test(searchTerm)) {
            const [day, month, year] = searchTerm.split("/");
            const formattedDate = `${year}-${month}-${day}`;
            formattedSearchTerm = `%${formattedDate}%`;
            whereClauses.push(`DATE(wt.transaction_date) LIKE ?`);
            queryParams.push(formattedSearchTerm);
        }
        else {
            whereClauses.push(`
        (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? 
        OR wt.transaction_id LIKE ? OR wt.transaction_amount LIKE ? OR wt.transaction_date LIKE ?)
      `);
            queryParams.push(formattedSearchTerm, formattedSearchTerm, formattedSearchTerm, formattedSearchTerm, formattedSearchTerm, formattedSearchTerm);
        }
    }
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const allowedSortFields = {
        user_name: "u.name",
        user_email: "u.email",
        user_phone: "u.phone",
        transaction_id: "wt.transaction_id",
        transaction_amount: "wt.transaction_amount",
        transaction_date: "wt.transaction_date",
    };
    let orderByClause = "";
    if (sortField && allowedSortFields[sortField]) {
        const validSortOrder = sortOrder === "desc" ? "desc" : "asc";
        orderByClause = ` ORDER BY ${allowedSortFields[sortField]} ${validSortOrder}`;
    }
    else {
        orderByClause = ` ORDER BY wt.updated_at DESC`;
    }
    const query = `
      SELECT 
        wt.*, 
        u.id AS user_id, 
        u.name AS user_name, 
        u.email AS user_email, 
        u.phone AS user_phone, 
        u.credit_limit, 
        u.status AS user_status
      FROM wallet_transactions wt
      LEFT JOIN users u ON wt.user_id = u.id
      ${whereClause}
      ${orderByClause}
      LIMIT ? OFFSET ?
    `;
    queryParams.push(safeLimit, offset);
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(query, queryParams, (err, results) => {
            if (err) {
                return reject(err);
            }
            const transactions = results;
            const countQuery = `
        SELECT COUNT(*) AS total 
        FROM wallet_transactions wt
        LEFT JOIN users u ON wt.user_id = u.id
        ${whereClause}
      `;
            databaseConnection_1.db.query(countQuery, queryParams.slice(0, -2), (err, countResults) => {
                if (err) {
                    return reject(err);
                }
                const total = countResults[0]?.total || 0;
                resolve({ transactions, total });
            });
        });
    });
};
exports.fetchAllTransactions = fetchAllTransactions;
const insertWalletLog = (log) => {
    const query = `
      INSERT INTO wallet_logs
      (user_id, order_id, order_date, before_balance, amount, after_balance, wallet_type, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    return new Promise((resolve, reject) => {
        const formattedOrderDate = log.order_date ? log.order_date : new Date();
        const descriptionCondition = log.wallet_type === "recharge"
            ? `${log.description} | Wallet balance: ₹${log.after_balance}`
            : log.wallet_type === "deductions from client"
                ? `Deducted ₹${log.amount} for ${log.description} | Wallet balance: ₹${log.after_balance}`
                : "";
        databaseConnection_1.db.query(query, [
            log.user_id,
            log.order_id ?? null,
            formattedOrderDate,
            log.before_balance,
            log.amount,
            log.after_balance,
            log.wallet_type,
            descriptionCondition,
        ], (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};
exports.insertWalletLog = insertWalletLog;
const updateWalletBalanceDections = async (userId, amount) => {
    const checkQuery = `SELECT * FROM wallet_balances WHERE user_id = ?`;
    const [results] = await databaseConnection_1.db.promise().query(checkQuery, [userId]);
    if (results.length > 0) {
        const updateQuery = `UPDATE wallet_balances SET balance = balance + ?, updated_at = NOW() WHERE user_id = ?`;
        await databaseConnection_1.db.promise().query(updateQuery, [amount, userId]);
    }
    else {
        const insertQuery = `INSERT INTO wallet_balances (user_id, balance, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
        await databaseConnection_1.db.promise().query(insertQuery, [userId, amount]);
    }
};
exports.updateWalletBalanceDections = updateWalletBalanceDections;
