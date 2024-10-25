import { OkPacket, RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

// Handle payments and orders
export const handlePaymentsOrders = async (placeOrderData) => {
  const { user_id, food_price, quantity, order_id, status } = placeOrderData;

  const totalOrderValue = food_price * quantity || 0;
  const deductionSuccess = await deductFromWalletBalance(
    user_id,
    totalOrderValue
  );
  if (!deductionSuccess) {
    throw new Error("Failed to deduct from wallet balance.");
  }

  const paymentSql = `
      INSERT INTO payments (price, user_id, status, method, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
  const paymentValues = [totalOrderValue, user_id, status, "wallet"];

  try {
    const [paymentResult]: [OkPacket, any] = await db
      .promise()
      .query(paymentSql, paymentValues);

    if (paymentResult.affectedRows === 0) {
      throw new Error("Payment insertion failed.");
    }

    // Fetch current wallet balance
    const [walletRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(`SELECT balance FROM wallet_balances WHERE user_id = ?`, [
        user_id,
      ]);

    const beforeBalance = walletRows[0]?.balance;

    const afterBalance = (beforeBalance - totalOrderValue).toFixed(2);

    // Log wallet transaction
    await logWalletTransaction(
      user_id,
      order_id,
      beforeBalance,
      totalOrderValue,
      afterBalance,
      `Rs ${totalOrderValue} deducted for user ID ${user_id}`
    );

    return true;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order.");
  }
};

// Log wallet transaction
const logWalletTransaction = async (
  userId,
  orderId,
  beforeBalance,
  amount,
  afterBalance,
  description
) => {
  const walletLogSql = `
    INSERT INTO wallet_logs (
      user_id, 
      order_id, 
      order_date, 
      before_balance, 
      amount, 
      after_balance, 
      wallet_type, 
      description, 
      created_at, 
      updated_at
    ) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, NOW(), NOW());
    `;

  const walletLogValues = [
    userId,
    orderId,
    beforeBalance,
    amount,
    afterBalance,
    "deduction",
    description,
  ];

  try {
    await db.promise().query(walletLogSql, walletLogValues);
  } catch (error) {
    console.error("Error logging wallet transaction:", error);
  }
};

// Deduct from wallet balance
export const deductFromWalletBalance = async (userId, amount) => {
  const sql = `
        UPDATE wallet_balances 
        SET balance = balance - ? 
        WHERE user_id = ?;
    `;

  try {
    const [result]: [OkPacket, any] = await db
      .promise()
      .query(sql, [amount, userId]);

    if (result.affectedRows === 0) {
      throw new Error("Wallet balance not found for the user.");
    }
    return true;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return false;
  }
};

// Get all place orders for a user
export const getAllPlaceOrdersUsers = async () => {
  const query = `
      SELECT 
        o.id AS order_id,
        o.user_id,
        fo.price AS food_price
        fo.quantity
      FROM 
        orders o
      LEFT JOIN 
        food_orders fo ON o.id = fo.order_id
      WHERE 
        DATE(o.order_date) = CURDATE() AND active= 1;
    `;

  const [placeOrderRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query);
  return placeOrderRows;
};

export const processTodaysOrders = async () => {
  try {
    const orders = await getAllPlaceOrdersUsers();
    if (orders.length === 0) {
      console.log("No orders to process for today.");
      return;
    }
    await Promise.all(orders.map((order) => handlePaymentsOrders(order)));
  } catch (error) {
    console.error("Error processing today's orders:", error);
  }
};
