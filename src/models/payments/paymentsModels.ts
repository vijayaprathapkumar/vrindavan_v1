import { OkPacket, RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";
import cron from "node-cron";
import moment from "moment";

export const handlePaymentsOrders = async (placeOrderData: any) => {
  const { user_id, food_price, quantity, order_id, status, food_name, unit } =
    placeOrderData;
  const totalOrderValue =
    parseFloat(food_price || "0") * parseInt(quantity || "0");

  // Start transaction
  await db.promise().query("START TRANSACTION");

  try {
    // 1. Verify wallet balance first
    const [walletRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(
        `SELECT balance FROM wallet_balances WHERE user_id = ? FOR UPDATE`,
        [user_id]
      );

    const currentBalance = parseFloat(walletRows[0]?.balance || "0");

    if (currentBalance < totalOrderValue) {
      await db.promise().query("ROLLBACK");
      throw new Error(
        `Insufficient wallet balance. Current: ${currentBalance}, Required: ${totalOrderValue}`
      );
    }

    // 2. Create payment record
    const paymentSql = `
      INSERT INTO payments (price, user_id, status, method, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
    const [paymentResult]: [OkPacket, any] = await db
      .promise()
      .query(paymentSql, [totalOrderValue, user_id, status, "wallet"]);

    if (paymentResult.affectedRows === 0) {
      await db.promise().query("ROLLBACK");
      throw new Error("Payment insertion failed.");
    }

    const paymentId = paymentResult.insertId;

    // 3. Update order with payment ID and status
    const updateOrderSql = `
      UPDATE orders 
      SET payment_id = ?,
          order_status_id = 2,
          updated_at = NOW()
      WHERE id = ?;
    `;
    await db.promise().query(updateOrderSql, [paymentId, order_id]);

    // 4. Deduct from wallet
    const deductionSql = `
      UPDATE wallet_balances 
      SET balance = balance - ?,
          updated_at = NOW()
      WHERE user_id = ?;
    `;
    const [deductionResult]: [OkPacket, any] = await db
      .promise()
      .query(deductionSql, [totalOrderValue, user_id]);

    if (deductionResult.affectedRows === 0) {
      await db.promise().query("ROLLBACK");
      throw new Error("Wallet deduction failed.");
    }

    // 5. Log wallet transaction
    const afterBalance = parseFloat(
      (currentBalance - totalOrderValue).toFixed(2)
    );
    const transactionDescription = `₹${totalOrderValue} deducted for ${food_name} ${unit} x ${quantity}. Balance ₹${currentBalance} → ₹${afterBalance}`;

    await logWalletTransaction(
      user_id,
      order_id,
      currentBalance,
      totalOrderValue,
      afterBalance,
      transactionDescription
    );

    // Commit transaction if all steps succeeded
    await db.promise().query("COMMIT");
    return true;
  } catch (error) {
    await db.promise().query("ROLLBACK");
    console.error("Error processing payment:", error);
    throw error;
  }
};

const logWalletTransaction = async (
  userId: number,
  orderId: number,
  beforeBalance: number,
  amount: number,
  afterBalance: number,
  description: string
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

  try {
    await db
      .promise()
      .query(walletLogSql, [
        userId,
        orderId,
        beforeBalance,
        amount,
        afterBalance,
        "deduction",
        description,
      ]);
  } catch (error) {
    console.error("Error logging wallet transaction:", error);
    throw error;
  }
};

export const getAllPlaceOrdersUsers = async (currentDate: string) => {
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
      AND o.payment_id IS NULL
  `;

  try {
    const [placeOrderRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(query, [currentDate]);
    return placeOrderRows;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const processTodayOrderPayments = async (currentDate: string) => {
  try {
    console.time("paymentProcessing");
    const orders = await getAllPlaceOrdersUsers(currentDate);

    if (orders.length === 0) {
      console.log("No unpaid orders to process for today.");
      return { processed: 0, skipped: 0 };
    }

    let processedCount = 0;
    let skippedCount = 0;

    // Process orders sequentially to avoid overloading the database
    for (const order of orders) {
      try {
        await handlePaymentsOrders(order);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process order ${order.order_id}:`, error);
        skippedCount++;
      }
    }

    console.timeEnd("paymentProcessing");
    console.log(
      `Payments processed: ${processedCount}, Skipped: ${skippedCount}`
    );
    return { processed: processedCount, skipped: skippedCount };
  } catch (error) {
    console.error("Error processing today's orders:", error);
    throw error;
  }
};

export const everyDayPaymentProcessJob = () => {
  cron.schedule("30 15 * * *", async () => {
    const jobStartTime = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`Payment processing cron job started at ${jobStartTime}...`);

    try {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];

      await processTodayOrderPayments(formattedDate);

      const jobEndTime = moment().format("YYYY-MM-DD HH:mm:ss");
      const jobDuration = moment(jobEndTime).diff(
        moment(jobStartTime),
        "seconds"
      );

      const logMessage = `Subscription orders bill placed on ${formattedDate}`;
      const cronLogEntry = `Job Start: ${jobStartTime}, Job End: ${jobEndTime}, Duration: ${jobDuration}s, Message: ${logMessage}`;

      await db.promise().query(
        `INSERT INTO cron_logs (log_date, cron_logs, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        [formattedDate, cronLogEntry]
      );

      console.log(
        `Payment processing job completed at ${jobEndTime}. Duration: ${jobDuration}s`
      );
    } catch (error) {
      console.error("Payment processing job failed:", error);

      // Log failure with the same format
      const errorLogEntry = `Job Start: ${jobStartTime}, Job End: ${moment().format(
        "YYYY-MM-DD HH:mm:ss"
      )}, Duration: ${moment().diff(
        moment(jobStartTime),
        "seconds"
      )}s, Message: Payment processing failed. Error: ${error.message}`;

      await db.promise().query(
        `INSERT INTO cron_logs (log_date, cron_logs, created_at, updated_at)
         VALUES (NOW(), ?, NOW(), NOW())`,
        [errorLogEntry]
      );
    }
  });
};
