import { OkPacket, RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";
import cron from "node-cron";

export const handlePaymentsOrders = async (placeOrderData) => {
  const { user_id, food_price, quantity, order_id, status, food_name, unit } =
    placeOrderData;

  const totalOrderValue =
    parseFloat(food_price || "0") * parseInt(quantity || "0");

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

    const [walletRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(`SELECT balance FROM wallet_balances WHERE user_id = ?`, [
        user_id,
      ]);

    const beforeBalance = parseFloat(walletRows[0]?.balance || "0");

    if (isNaN(beforeBalance) || beforeBalance === 0) {
      console.log("Wallet balance not found or is 0. Skipping deduction.");
    }

    const afterBalance = parseFloat(
      (beforeBalance - totalOrderValue).toFixed(2)
    );

    const transactionDescription = `₹${totalOrderValue} deducted for ${food_name} ${unit} x ${quantity}. Balance ₹${afterBalance}`;

    // Log wallet transaction
    await logWalletTransaction(
      user_id,
      order_id,
      beforeBalance,
      totalOrderValue,
      afterBalance,
      transactionDescription
    );

    return true;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order.");
  }
};

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

export const getAllPlaceOrdersUsers = async () => {
  const query = `
      SELECT 
        o.id AS order_id,
        o.user_id,
        fo.price AS food_price,
        fo.quantity,
        f.name AS food_name,
        f.unit
      FROM 
        orders o
      LEFT JOIN 
        food_orders fo ON o.id = fo.order_id
      LEFT JOIN 
        foods f ON f.id = fo.food_id
      WHERE 
        DATE(o.order_date) = CURDATE() AND active= 1;
    `;

  const [placeOrderRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query);
  return placeOrderRows;
};

export const processTodayOrderPayments = async () => {
  try {
    console.time("paymentProcessing");
    const orders = await getAllPlaceOrdersUsers();
    console.log("orders", orders);

    if (orders.length === 0) {
      console.log("No orders to process for today.");
      return;
    }
    await Promise.all(orders.map((order) => handlePaymentsOrders(order)));
    console.timeEnd("paymentProcessing");
    console.log("Today's payment processed successfully.");
  } catch (error) {
    console.error("Error processing today's orders:", error);
  }
};

export const everyDayPaymentProcessJob = () => {
  cron.schedule("00 15 * * *", async () => {
    console.log("Cron job running...");

    await processTodayOrderPayments();
  });
};
