import { db } from "../../config/databaseConnection";

export const getWalletBalance = async (userId: string) => {
  const query = `SELECT balance FROM wallet_balances WHERE user_id = ?`;
  const [result]: any = await db.promise().query(query, [userId]);
  return result;
};

export const updateWalletBalance = async (userId: string, amount: number) => {
  const query = `
    UPDATE wallet_balances
    SET balance = balance + ?, updated_at = NOW()
    WHERE user_id = ?
  `;
  await db.promise().query(query, [amount, userId]);
};


export const insertWalletLog = async (
  userId: string,
  orderDate: Date,
  beforeBalance: number,
  amount: number,
  afterBalance: number,
  description: string
) => {
  const query = `
    INSERT INTO wallet_logs 
    (user_id, order_id, order_date, before_balance, amount, after_balance, wallet_type, description, created_at, updated_at)
    VALUES (?, NULL, ?, ?, ?, ?, 'refund', ?, NOW(), NOW())
  `;
  await db.promise().query(query, [
    userId,
    orderDate,
    beforeBalance,
    amount,
    afterBalance,
    description,
  ]);
};
