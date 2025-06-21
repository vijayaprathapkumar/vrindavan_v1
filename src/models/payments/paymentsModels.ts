import { OkPacket, RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";
import cron from "node-cron";
import moment from "moment";

// Type definitions for better type safety
interface OrderData {
  user_id: number;
  food_price: string;
  quantity: string;
  order_id: number;
  status: string;
  food_name: string;
  unit: string;
}

interface PaymentResult {
  processed: number;
  skipped: number;
  failedOrders?: number[];
}

interface WalletLogData {
  userId: number;
  orderId: number;
  beforeBalance: number;
  amount: number;
  afterBalance: number;
  description: string;
}

/**
 * Handles payment processing for a single order
 */
export const handlePaymentsOrders = async (
  placeOrderData: OrderData
): Promise<boolean> => {
  const { user_id, food_price, quantity, order_id, status, food_name, unit } =
    placeOrderData;
  const totalOrderValue =
    parseFloat(food_price || "0") * parseInt(quantity || "0");

  // Start transaction
  await db.promise().query("START TRANSACTION");

  try {
    // 1. Verify wallet balance with row locking
    const [walletRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(
        `SELECT balance FROM wallet_balances WHERE user_id = ? FOR UPDATE`,
        [user_id]
      );

    if (!walletRows.length) {
      await db.promise().query("ROLLBACK");
      throw new Error(`Wallet not found for user ${user_id}`);
    }

    const currentBalance = parseFloat(walletRows[0].balance || "0");

    if (currentBalance < totalOrderValue) {
      await db.promise().query("ROLLBACK");
      throw new Error(
        `Insufficient wallet balance. Current: ${currentBalance}, Required: ${totalOrderValue}`
      );
    }

    // 2. Create payment record
    const [paymentResult]: [OkPacket, any] = await db.promise().query(
      `INSERT INTO payments (price, user_id, status, method, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [totalOrderValue, user_id, status, "wallet"]
    );

    if (paymentResult.affectedRows === 0) {
      await db.promise().query("ROLLBACK");
      throw new Error("Payment insertion failed.");
    }

    const paymentId = paymentResult.insertId;

    // 3. Update order status and payment reference
    const [updateResult]: [OkPacket, any] = await db.promise().query(
      `UPDATE orders 
         SET payment_id = ?, is_wallet_deduct = ?, order_status_id = 2, updated_at = NOW()
         WHERE id = ?`,
      [paymentId, 1, order_id]
    );

    if (updateResult.affectedRows === 0) {
      await db.promise().query("ROLLBACK");
      throw new Error(`Order ${order_id} update failed`);
    }

    // 4. Deduct from wallet
    const [deductionResult]: [OkPacket, any] = await db.promise().query(
      `UPDATE wallet_balances 
         SET balance = balance - ?, updated_at = NOW()
         WHERE user_id = ?`,
      [totalOrderValue, user_id]
    );

    if (deductionResult.affectedRows === 0) {
      await db.promise().query("ROLLBACK");
      throw new Error("Wallet deduction failed.");
    }

    // 5. Log wallet transaction
    const afterBalance = parseFloat(
      (currentBalance - totalOrderValue).toFixed(2)
    );
    const transactionDescription = `₹${totalOrderValue} deducted for ${food_name} ${unit} x ${quantity}. Balance ₹${currentBalance} → ₹${afterBalance}`;

    await logWalletTransaction({
      userId: user_id,
      orderId: order_id,
      beforeBalance: currentBalance,
      amount: totalOrderValue,
      afterBalance: afterBalance,
      description: transactionDescription,
    });

    // Commit transaction if all steps succeeded
    await db.promise().query("COMMIT");
    return true;
  } catch (error) {
    await db.promise().query("ROLLBACK");
    console.error(`Error processing order ${order_id}:`, error);
    throw error;
  }
};

/**
 * Logs wallet transactions for audit purposes
 */
const logWalletTransaction = async (data: WalletLogData): Promise<void> => {
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
    ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, NOW(), NOW());
  `;

  try {
    await db
      .promise()
      .query(walletLogSql, [
        data.userId,
        data.orderId,
        data.beforeBalance,
        data.amount,
        data.afterBalance,
        "deduction",
        data.description,
      ]);
  } catch (error) {
    console.error("Error logging wallet transaction:", error);
    throw error;
  }
};

/**
 * Retrieves all unpaid orders for a specific date
 */
export const getAllPlaceOrdersUsers = async (
  currentDate: string
): Promise<OrderData[]> => {
  const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.order_date,
      fo.price AS food_price,
      fo.quantity,
      f.name AS food_name,
      f.unit,
      o.payment_id
    FROM 
      orders o
    LEFT JOIN 
      food_orders fo ON o.id = fo.order_id
    LEFT JOIN 
      foods f ON f.id = fo.food_id
    WHERE 
      DATE(o.order_date) = ?
      AND o.is_wallet_deduct = 0
      ORDER BY o.id ASC
  `;

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, [currentDate]);

  return rows.map((row) => ({
    user_id: row.user_id,
    food_price: row.food_price,
    quantity: row.quantity,
    order_id: row.order_id,
    status: "completed",
    food_name: row.food_name,
    unit: row.unit,
  }));
};

/**
 * Processes all unpaid orders for a given date
 */
export const processTodayOrderPayments = async (
  currentDate: string
): Promise<PaymentResult> => {
  try {
    console.time("paymentProcessing");
    const orders = await getAllPlaceOrdersUsers(currentDate);
    console.log(`Found ${orders.length} unpaid orders for date ${currentDate}`);

    if (orders.length === 0) {
      console.log("No unpaid orders to process for today.");
      return { processed: 0, skipped: 0 };
    }

    let processedCount = 0;
    let skippedCount = 0;
    const failedOrders: number[] = [];

    // Process orders sequentially
    for (const order of orders) {
      try {
        const success = await handlePaymentsOrders(order);
        if (success) {
          processedCount++;
          console.log(`Successfully processed order ${order.order_id}`);
        }
      } catch (error) {
        skippedCount++;
        failedOrders.push(order.order_id);
        console.error(`Failed to process order ${order.order_id}:`, error);
      }
    }

    console.timeEnd("paymentProcessing");
    console.log(
      `Payments processed: ${processedCount}, Skipped: ${skippedCount}` +
        (failedOrders.length > 0
          ? ` (Failed orders: ${failedOrders.join(", ")})`
          : "")
    );

    return {
      processed: processedCount,
      skipped: skippedCount,
      failedOrders: failedOrders.length > 0 ? failedOrders : undefined,
    };
  } catch (error) {
    console.error("Error processing today's orders:", error);
    throw error;
  }
};

/**
 * Sets up the daily cron job for payment processing
 */
export const everyDayPaymentProcessJob = (): void => {
  cron.schedule("30 15 * * *", async () => {
    const jobStart = moment();
    const jobStartTime = jobStart.format("YYYY-MM-DD HH:mm:ss");
    console.log(`Payment processing cron job started at ${jobStartTime}...`);

    let insertedLogId: number | null = null;

    try {
      const currentDate = new Date();
      const formattedDate = moment(currentDate).format("YYYY-MM-DD");
      console.log("Processing orders for date:", formattedDate);

      // Insert "start" log entry
      const insertSql = `
        INSERT INTO cron_logs (log_date, cron_logs, created_at, updated_at)
        VALUES (NOW(), ?, NOW(), NOW())
      `;
      const initialLogMessage = `Job Start: ${jobStartTime}, Status: Started`;
      const [insertResult]: any = await db.promise().query(insertSql, [initialLogMessage]);
      insertedLogId = insertResult.insertId;

      // Execute job logic
      const result = await processTodayOrderPayments(formattedDate);

      // Compute end time and duration
      const jobEnd = moment();
      const jobEndTime = jobEnd.format("YYYY-MM-DD HH:mm:ss");
      const jobDuration = jobEnd.diff(jobStart, "seconds");
      const finalLogMessage = `Job Start: ${jobStartTime}, Job End: ${jobEndTime}, Duration: ${jobDuration}s, Message: Subscription orders bill placed on ${currentDate.toLocaleString()}`;

      // Update the inserted log row
      const updateSql = `
        UPDATE cron_logs
        SET cron_logs = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await db.promise().query(updateSql, [finalLogMessage, insertedLogId]);

      console.log("Today's payment processed successfully.");
    } catch (error) {
      console.error("Error running processTodayOrderPayments:", error);

      if (insertedLogId) {
        const failMessage = `Job Start: ${jobStartTime}, Status: Failed, Error: ${error.message}`;
        const updateSql = `
          UPDATE cron_logs
          SET cron_logs = ?, updated_at = NOW()
          WHERE id = ?
        `;
        await db.promise().query(updateSql, [failMessage, insertedLogId]);
      }
    }
  });
};
