import moment from "moment";
import cron from "node-cron";
import { db } from "../../config/databaseConnection";
import { RowDataPacket, FieldPacket, OkPacket } from "mysql2";
import pLimit from "p-limit";

// Fetch subscriptions in batches with optimized query
async function fetchSubscriptions(
  lastId: number,
  batchSize: number,
  nextDate: Date
): Promise<RowDataPacket[]> {
  const nextDateFormatted = moment(nextDate).format("YYYY-MM-DD");
  console.log("nextDateFormatted", nextDateFormatted);

  const query = `
    SELECT 
      us.*,
      COALESCE(sqc.quantity, us.quantity) AS effective_quantity
    FROM user_subscriptions us
    LEFT JOIN subscription_quantity_changes sqc 
      ON us.id = sqc.user_subscription_id
      AND sqc.order_date = ?
      AND (sqc.cancel_order IS NULL OR sqc.cancel_order != 1)
    LEFT JOIN subscription_quantity_changes sqc_cancel
      ON us.id = sqc_cancel.user_subscription_id
      AND sqc_cancel.order_date = ?
      AND sqc_cancel.cancel_order = 1
    WHERE us.active = 1 
      AND us.is_pause_subscription = 0 
      AND us.cancel_subscription = 0
      AND us.id > ? 
      AND us.start_date <= ? 
      AND (us.end_date >= ? OR us.end_date IS NULL)
      AND (sqc.id IS NULL OR sqc.quantity != 0)
      AND sqc_cancel.id IS NULL
    ORDER BY us.id ASC
    LIMIT ?
  `;

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db
      .promise()
      .query(query, [
        nextDateFormatted,
        nextDateFormatted,
        lastId,
        nextDateFormatted,
        nextDateFormatted,
        batchSize,
      ]);
    return rows;
  } catch (error) {
    console.error("Error fetching subscriptions:", {
      lastId,
      batchSize,
      nextDate: nextDateFormatted,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw new Error("Failed to fetch subscriptions.");
  }
}

// Cache for product data to reduce repeated queries
const productCache = new Map<number, any>();
const cacheTTL = 5 * 60 * 1000; // 5 minutes
const cacheLastUpdated = new Map<number, number>();

// Get product with stock information
const getProductById = async (product_id: number) => {
  const now = Date.now();
  if (
    productCache.has(product_id) &&
    now - (cacheLastUpdated.get(product_id) || 0) < cacheTTL
  ) {
    return productCache.get(product_id);
  }

  const query = `
    SELECT 
      f.id,
      f.price, 
      f.discount_price, 
      f.track_inventory,
      f.status,
      (
        SELECT COALESCE(SUM(CAST(amount AS SIGNED)), 0)
        FROM stock_mutations 
        WHERE stockable_id = f.id 
      ) AS current_stock
    FROM foods f
    WHERE f.id = ?;
  `;

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db
      .promise()
      .query(query, [product_id]);

    if (!rows.length) return null;

    const product = {
      ...rows[0],
      track_inventory: Number(rows[0].track_inventory),
      current_stock: Number(rows[0].current_stock),
    };

    productCache.set(product_id, product);
    cacheLastUpdated.set(product_id, now);
    return product;
  } catch (error) {
    console.error(
      `Error fetching product ${product_id}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    throw error;
  }
};

// Check wallet balance
const checkWalletBalance = async (
  userId: number,
  amount: number
): Promise<boolean> => {
  const query = `SELECT balance FROM wallet_balances WHERE user_id = ?`;
  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db
      .promise()
      .query(query, [userId]);
    return rows.length > 0 && parseFloat(rows[0].balance) >= amount;
  } catch (error) {
    console.error(`Wallet check failed for user ${userId}:`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
};

// Update inventory with stock mutation
const updateInventory = async (product_id: number, quantity: number) => {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [stockRows] = await conn.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(CAST(amount AS SIGNED)), 0) AS stock 
       FROM stock_mutations 
       WHERE stockable_id = ?`,
      [product_id]
    );

    const currentStock = Number(stockRows[0].stock);
    if (currentStock + quantity < 0) {
      throw new Error(`Insufficient stock for product ${product_id}`);
    }

    await conn.query(
      `INSERT INTO stock_mutations (
        stockable_type, 
        stockable_id, 
        amount, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, NOW(), NOW())`,
      ["App\\Models\\Food", product_id, quantity]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    console.error(`Error updating inventory for product ${product_id}:`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  } finally {
    conn.release();
  }
};

// Insert into orders table
const addOrdersEntry = async (userId: number, tomorrow: Date) => {
  const addressQuery = `
    SELECT da.id AS delivery_address_id, da.*, l.route_id, l.hub_id
    FROM delivery_addresses da
    LEFT JOIN localities l ON da.locality_id = l.id
    WHERE da.user_id = ? LIMIT 1;
  `;

  try {
    const [rows]: [RowDataPacket[], FieldPacket[]] = await db
      .promise()
      .query(addressQuery, [userId]);

    const address = rows[0];
    if (!address) {
      throw new Error(`No address found for user ${userId}`);
    }
    let deliveryBoyId = null;
    const localityDeliveryBoyQuery = `
      SELECT delivery_boy_id 
      FROM locality_delivery_boys 
      WHERE locality_id = ?
      LIMIT 1
    `;

    const [localityDeliveryBoys]: [RowDataPacket[], FieldPacket[]] = await db
      .promise()
      .query(localityDeliveryBoyQuery, [address.locality_id]);

    if (localityDeliveryBoys.length > 0) {
      deliveryBoyId = localityDeliveryBoys[0].delivery_boy_id;
    }

    const insertQuery = `
      INSERT INTO orders (
        user_id, order_type, order_date, route_id, hub_id, locality_id, delivery_boy_id,
        order_status_id, tax, delivery_fee, delivery_address_id, 
        is_wallet_deduct, created_at, updated_at
      ) VALUES (?, 2, ?, ?, ?, ?, ?, 3, 0.0, 0.0, ?, 0, NOW(), NOW());
    `;

    const [result]: [OkPacket, FieldPacket[]] = await db
      .promise()
      .query(insertQuery, [
        userId,
        moment(tomorrow).format("YYYY-MM-DD"),
        address.route_id,
        address.hub_id,
        address.locality_id,
        deliveryBoyId,
        address.delivery_address_id,
      ]);

    return result.insertId ? { status: true, orderId: result.insertId } : null;
  } catch (error) {
    console.error(`Error creating order for user ${userId}:`, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
};

// Insert into food_orders table
const addFoodOrderEntry = async (
  price: number,
  quantity: number,
  foodId: number,
  orderId: number
) => {
  const query = `
    INSERT INTO food_orders (
      price, quantity, food_id, order_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, NOW(), NOW());
  `;
  await db.promise().query(query, [price, quantity, foodId, orderId]);
};

// Create product order
export const createOrder = async (
  subscription: any,
  quantityToOrder: number,
  tomorrow: Date
) => {
  const { product_id, user_id } = subscription;

  try {
    const product = await getProductById(product_id);
    if (!product) {
      return { success: false, reason: "missing_product" };
    }

    const trackInventory = Number(product.track_inventory);
    const currentStock = Number(product.current_stock);

    if (trackInventory === 1) {
      console.log(`Checking stock for product ${product_id}`, {
        currentStock,
        quantityToOrder,
        trackInventory,
      });

      if (currentStock <= 0) {
        console.error(`Out of stock for product ${product_id}`);
        return { success: false, reason: "out_of_stock" };
      }
      if (currentStock < quantityToOrder) {
        console.error(
          `Insufficient stock for product ${product_id} (has ${currentStock}, needs ${quantityToOrder})`
        );
        return { success: false, reason: "insufficient_stock" };
      }
    }

    const productAmount = product.discount_price || product.price;
    const totalAmount = productAmount * quantityToOrder;

    const hasBalance = await checkWalletBalance(user_id, totalAmount);
    if (!hasBalance) {
      return { success: false, reason: "insufficient_balance" };
    }

    const order = await addOrdersEntry(user_id, tomorrow);
    if (!order?.orderId) {
      return { success: false, reason: "order_creation_failed" };
    }

    await addFoodOrderEntry(
      productAmount,
      quantityToOrder,
      product_id,
      order.orderId
    );

    if (trackInventory === 1) {
      await updateInventory(product_id, -quantityToOrder);
    }

    return { success: true };
  } catch (error) {
    console.error(
      `Error processing product ${product_id} for user ${user_id}:`,
      {
        error: error instanceof Error ? error.message : "Unknown error",
      }
    );
    return {
      success: false,
      reason: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Handle creating next day's orders with concurrency control
export async function handleNextDayOrders(testDate?: Date) {
  const currentDate = testDate ? moment(testDate).toDate() : new Date();
  const nextDate = moment(currentDate).add(1, "days").toDate();
  const nextDayName = moment(nextDate).format("dddd").toLowerCase();

  console.log(
    `Processing orders for: ${moment(nextDate).format("YYYY-MM-DD")}`,
    { nextDayName }
  );

  let lastId = 0;
  const batchSize = 100;
  const failedSubscriptions: number[] = [];
  const limit = pLimit(10); // Limit concurrent operations to 10

  while (true) {
    try {
      const subscriptions = await fetchSubscriptions(
        lastId,
        batchSize,
        nextDate
      );
      if (subscriptions.length === 0) break;

      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          limit(async () => {
            try {
              const cancelCheckQuery = `
                SELECT 1 FROM subscription_quantity_changes 
                WHERE user_subscription_id = ? 
                  AND cancel_order_date = ? 
                  AND cancel_order = 1
                LIMIT 1
              `;

              const [cancelRows]: [RowDataPacket[], FieldPacket[]] = await db
                .promise()
                .query(cancelCheckQuery, [
                  sub.id,
                  moment(nextDate).format("YYYY-MM-DD"),
                ]);

              if (cancelRows.length > 0) {
                console.log(
                  `Skipping order for subscription ${sub.id} due to cancel order`
                );
                return;
              }

              let quantity = 0;
              const lastOrderDate = new Date(sub.start_date);
              console.log("lastOrderDate", lastOrderDate);

              switch (sub.subscription_type) {
                case "everyday":
                  quantity = sub.effective_quantity;
                  break;
                case "alternative_day":
                  const altDayDiff = moment(nextDate).diff(
                    moment(sub.start_date),
                    "days"
                  );
                  if (altDayDiff % 2 === 0) {
                    quantity = sub.effective_quantity;
                  }
                  break;
                case "every_3_day":
                  const threeDayDiff = moment(nextDate).diff(
                    moment(sub.start_date),
                    "days"
                  );
                  if (threeDayDiff % 3 === 0) {
                    quantity = sub.effective_quantity;
                  }
                  break;

                case "every_7_day":
                  const sevenDayDiff = moment(nextDate).diff(
                    moment(sub.start_date),
                    "days"
                  );
                  if (sevenDayDiff % 7 === 0) {
                    quantity = sub.effective_quantity;
                  }
                  break;

                case "customize":
                  quantity = sub[`${nextDayName}_qty`] || 0;
                  break;

                default:
                  quantity = 0;
                  break;
              }

              if (quantity > 0) {
                const result = await createOrder(sub, quantity, nextDate);
                if (!result.success) {
                  failedSubscriptions.push(sub.id);
                  console.warn(
                    `Order failed for subscription ${sub.id} - Reason: ${result.reason}`,
                    { error: result.error }
                  );
                }
              }
            } catch (err) {
              failedSubscriptions.push(sub.id);
              console.error(`Error processing subscription ${sub.id}:`, {
                error: err instanceof Error ? err.message : "Unknown error",
              });
            }
          })
        )
      );

      lastId = subscriptions[subscriptions.length - 1].id;
    } catch (error) {
      console.error("Error fetching subscription batch:", {
        lastId,
        batchSize,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Optional: Add retry logic for failed batches
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay before next batch
    }
  }

  if (failedSubscriptions.length > 0) {
    console.error(
      `Failed to process ${failedSubscriptions.length} subscriptions`,
      {
        failedSubscriptions,
      }
    );
    // Optionally notify admin or queue for retry
  }
}
// CRON Job for subscriptions
export const subscriptionsJob = () => {
  cron.schedule("30 21 * * *", async () => {
    console.log("Cron job running...");
    console.time("subscriptionsProcessing");

    const cronLogcurrentDate = new Date();
    const nextDate = new Date(cronLogcurrentDate);

    const jobStart = moment();
    const jobStartTime = jobStart.format("YYYY-MM-DD HH:mm:ss");

    let insertedLogId: number | null = null;

    try {
      // Insert initial log
      const insertSql = `
        INSERT INTO cron_logs (log_date, cron_logs, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `;
      const initialLogMessage = `Job Start: ${jobStartTime}, Status: Started`;
      const insertValues = [nextDate.toISOString().split("T")[0], initialLogMessage];
      const [insertResult]: any = await db.promise().query(insertSql, insertValues);
      insertedLogId = insertResult.insertId;

      // Process job logic
      await handleNextDayOrders();

      const jobEnd = moment();
      const jobEndTime = jobEnd.format("YYYY-MM-DD HH:mm:ss");
      const jobDuration = jobEnd.diff(jobStart, "seconds");

      const finalLogMessage = `Job Start: ${jobStartTime}, Job End: ${jobEndTime}, Duration: ${jobDuration}s, Message: Subscription orders placed for date ${nextDate.toISOString().split("T")[0]} and placed on ${cronLogcurrentDate.toLocaleString()}`;

      // Update log with end time and full message
      const updateSql = `
        UPDATE cron_logs
        SET cron_logs = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await db.promise().query(updateSql, [finalLogMessage, insertedLogId]);

      console.timeEnd("subscriptionsProcessing");
      console.log("Today's subscription processed successfully.");
    } catch (error) {
      console.error("Error running subscriptions job:", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (insertedLogId) {
        const failMessage = `Job Start: ${jobStartTime}, Status: Failed, Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;

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

// CRON Job for pausing subscriptions
export const pauseSubscriptionsJobs = async () => {
  cron.schedule("0 0 * * *", async () => {
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const sql = `
      UPDATE user_subscriptions
      SET
        is_pause_subscription = 0,
        pause_until_i_come_back = 0,
        pause_specific_period_startDate = NULL,
        pause_specific_period_endDate = NULL
      WHERE
        (is_pause_subscription = 1 OR 
         pause_until_i_come_back = 1 OR 
         pause_specific_period_startDate IS NOT NULL OR 
         pause_specific_period_endDate IS NOT NULL) AND 
        (pause_specific_period_endDate <= ?);
    `;

    try {
      const [result]: [OkPacket, FieldPacket[]] = await db
        .promise()
        .query(sql, [currentDate]);
      console.log(
        `Updated ${result.affectedRows} subscriptions that reached their end date`
      );
    } catch (error) {
      console.error("Error updating subscriptions:", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};
