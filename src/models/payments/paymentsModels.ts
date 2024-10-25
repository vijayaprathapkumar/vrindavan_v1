import { OkPacket, RowDataPacket } from "mysql2";
import cron from "node-cron";
import { db } from "../../config/databaseConnection";

// Handle payments and orders
export const handlePaymentsOrders = async (placeOrderData) => {
    const { price, userId, status, method } = placeOrderData;
  
    const paymentSql = `
      INSERT INTO payments (price, user_id, status, method, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
    const paymentValues = [price, userId, status, method];
  
    try {
      const [paymentResult]: [OkPacket, any] = await db.promise().query(paymentSql, paymentValues);
  
      if (paymentResult.affectedRows === 0) {
        throw new Error("Payment insertion failed.");
      }
  
      const orderId = paymentResult.insertId;
  
      // Fetch current wallet balance
      const [walletRows]: [RowDataPacket[], any] = await db.promise().query(
        `SELECT balance FROM wallet_balances WHERE user_id = ?`,
        [userId]
      );
  
      const beforeBalance = walletRows[0]?.balance;
  
      // Log the user ID and amount before deduction
      console.log(`Deducting Rs ${price} from user ID ${userId}`);
  
      // Deduct amount from wallet
      const deductionSuccess = await deductFromWalletBalance(userId, price);
      if (!deductionSuccess) {
        throw new Error("Failed to deduct from wallet balance.");
      }
  
      const afterBalance = (beforeBalance - price).toFixed(2);
  
      // Log wallet transaction
      await logWalletTransaction(
        userId,
        orderId,
        beforeBalance,
        price,
        afterBalance,
        `Rs ${price} deducted for user ID ${userId}`
      );
  
      return price; // Return the total price
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
      order_item_id, 
      before_balance, 
      amount, 
      after_balance, 
      wallet_type, 
      description, 
      created_at, 
      updated_at
    ) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;

  const walletLogValues = [
    userId,
    orderId,
    null,
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
        o.order_type,
        o.order_date,
        o.route_id,
        o.hub_id,
        o.locality_id,
        o.delivery_boy_id,
        o.order_status_id,
        o.tax,
        o.delivery_fee,
        o.hint,
        o.active,
        o.driver_id,
        o.delivery_address_id,
        o.payment_id,
        o.is_wallet_deduct,
        o.delivery_status,
        o.created_at AS order_created_at,
        o.updated_at AS order_updated_at,
        fo.id AS food_order_id,
        fo.price AS food_price,
        fo.quantity,
        fo.food_id,
        fo.order_id,
        fo.created_at AS food_created_at,
        fo.updated_at AS food_updated_at 
      FROM 
        orders o
      LEFT JOIN 
        food_orders fo ON o.id = fo.order_id
      WHERE 
        DATE(o.order_date) = CURDATE();
    `;
  
    const [placeOrderRows]: [RowDataPacket[], any] = await db.promise().query(query);
    return placeOrderRows;
  };



  export const processTodaysOrders = async () => {
    try {
      const orders = await getAllPlaceOrdersUsers();
      console.log("Today's orders:", orders);
  
      // Group orders by user_id
      const ordersByUserId = orders.reduce((acc, order) => {
        const userId = order.user_id;
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push(order);
        return acc;
      }, {});
  
      // Process actions for each user
      for (const userId in ordersByUserId) {
        const userOrders = ordersByUserId[userId];
        console.log(`Processing orders for user ID ${userId}`, userOrders);
  
        for (const order of userOrders) {
          const placeOrderPaymentData = {
            price: order.food_price,  
            userId: userId,
            status: "paid",
            method: "wallet",
          };
  
          await handlePaymentsOrders(placeOrderPaymentData);
        }
      }
    } catch (error) {
      console.error("Error processing today's orders:", error);
    }
  };