import { OkPacket, RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection"; 

export interface WalletTransaction {
    transaction_id: string;
    rp_payment_id: string;
    rp_order_id: string;
    user_id: string;
    plan_id: string;
    transaction_date: string;
    extra_percentage: number;
    plan_amount: number;
    extra_amount: number;
    transaction_amount: number;
    transaction_type: string;
    status: string;
    description: string;
}

export interface TransactionsResponse {
    transactions: WalletTransaction[]; 
    total: number; 
}

export const insertWalletTransaction = (transaction: WalletTransaction): Promise<void> => {
    const query = `
        INSERT INTO wallet_transactions 
        (transaction_id, rp_payment_id, rp_order_id, user_id, plan_id, transaction_date, extra_percentage, plan_amount, extra_amount, transaction_amount, transaction_type, status, description, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    return new Promise((resolve, reject) => {
        db.query(
            query,
            [
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
            ],
            (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            }
        );
    });
};


export const updateWalletBalance = async (userId: string, amount: number): Promise<void> => {
    const checkQuery = `SELECT * FROM wallet_balances WHERE user_id = ?`;

    const [results]: any = await db.promise().query(checkQuery, [userId]);

    if (results.length > 0) {
        const updateQuery = `
            UPDATE wallet_balances
            SET balance = balance + ?, updated_at = NOW()
            WHERE user_id = ?
        `;
        await  db.promise().query(updateQuery, [amount, userId]);
    } else {
        const insertQuery = `
            INSERT INTO wallet_balances (user_id, balance, created_at, updated_at)
            VALUES (?, ?, NOW(), NOW())
        `;
        await db.promise().query(insertQuery, [userId, amount]);
    }
};


export const getTransactionsByUserId = (userId: string, page: number, limit: number): Promise<TransactionsResponse> => {
    const offset = (page - 1) * limit;
    const query = `
        SELECT * FROM wallet_transactions
        WHERE user_id = ?
        ORDER BY updated_at DESC 
        LIMIT ? OFFSET ?
    `;

    return new Promise((resolve, reject) => {
        db.query(query, [userId, limit, offset], (err, results) => {
            if (err) {
                return reject(err);
            }

            const transactions: WalletTransaction[] = results as WalletTransaction[];

            const countQuery = `SELECT COUNT(*) AS total FROM wallet_transactions WHERE user_id = ?`;
            db.query(countQuery, [userId], (err, countResults) => {
                if (err) {
                    return reject(err);
                }
                const total = countResults[0]?.total || 0;
                resolve({ transactions, total });
            });
        });
    });
};


export const fetchAllTransactions = (page: number, limit: number): Promise<TransactionsResponse> => {
    const offset = (page - 1) * limit;
    const query = `
        SELECT * FROM wallet_transactions
        ORDER BY updated_at DESC 
        LIMIT ? OFFSET ?
    `;
  
    return new Promise((resolve, reject) => {
      db.query(query, [limit, offset], (err, results) => {
        if (err) {
          return reject(err);
        }
  
        const transactions: WalletTransaction[] = results as WalletTransaction[];

        const countQuery = `SELECT COUNT(*) AS total FROM wallet_transactions`;
        db.query(countQuery, (err, countResults) => {
          if (err) {
            return reject(err);
          }
          const total = countResults[0]?.total || 0;
          resolve({ transactions, total });
        });
      });
    });
  };