import moment from "moment";
import { db } from "../../config/databaseConnection";
import { FieldPacket, OkPacket, RowDataPacket } from "mysql2";
import cron from "node-cron";

async function fetchSubscriptions(lastId = 0, batchSize) {
  const [subscriptions]: [RowDataPacket[], FieldPacket[]] = await db
    .promise()
    .query(
      `SELECT * FROM user_subscriptions 
         WHERE active = 1 
         AND is_pause_subscription = 0 
         AND id > ? 
         LIMIT ?`,
      [lastId, batchSize]
    );
  return subscriptions;
}

export async function handleNextDayOrders(currentDate) {
  const tomorrow = moment(currentDate).add(1, "days");
  const customizeDate = moment(currentDate).add(0, "days");
  const dayOfWeek = customizeDate.format("dddd").toLowerCase();
  let lastId = 0;
  const batchSize = 100;

  while (true) {
    try {
      const subscriptions = await withTimeout(
        fetchSubscriptions(lastId, batchSize),
        5000
      );
      if (subscriptions.length === 0) break;

      await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            let quantityToOrder = 0;
            const lastOrderDate = moment(sub.last_order_date);

            switch (sub.subscription_type) {
              case "everyday":
                quantityToOrder = sub.quantity;
                break;
              case "alternative_day":
                if (tomorrow.diff(lastOrderDate, "days") % 2 === 0) {
                  quantityToOrder = sub.quantity;
                }
                break;
              case "every_3_day":
                if (tomorrow.diff(lastOrderDate, "days") % 3 === 0) {
                  quantityToOrder = sub.quantity;
                }
                break;
              case "every_7_day":
                if (tomorrow.diff(lastOrderDate, "days") % 7 === 0) {
                  quantityToOrder = sub.quantity;
                }
                break;
              case "customize":
                quantityToOrder = sub[`${dayOfWeek}_qty`];
                break;
              default:
                return;
            }
            if (quantityToOrder > 0) {
              const orderResult = await createOrder(
                sub,
                quantityToOrder,
                currentDate
              );
              if (!orderResult.success) {
                if (orderResult.reason === "missing_product") {
                  console.warn(
                    `Subscription ID ${sub.id}: Missing product. Skipping.`
                  );
                } else {
                  console.error(
                    `Subscription ID ${sub.id}: Failed to create order.`
                  );
                }
              }
            }
          } catch (error) {
            console.error(`Error processing subscription ID ${sub.id}:`, error);
          }
        })
      );

      lastId = subscriptions[subscriptions.length - 1].id;
    } catch (error) {
      console.error("Error fetching or processing subscriptions:", error);
      break;
    }
  }
}

const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), ms)
  );
  return Promise.race([promise, timeout]);
};

export const createOrder = async (orderItem, quantityToOrder, currentDate) => {
  const { product_id, user_id } = orderItem || {};

  try {
    const productData = await withTimeout(getProductById(product_id), 5000);

    if (!productData || productData.length === 0) {
      console.warn(
        `Product with ID ${product_id} not found. Skipping order for user ${user_id}.`
      );
      return { success: false, reason: "missing_product" };
    }

    const { discount_price, price } = productData[0];
    const productAmount = discount_price || price;

    if (productAmount > 0) {
      const orderData = await withTimeout(
        addOrdersEntry(user_id, currentDate),
        5000
      );
      if (orderData?.orderId) {
        await withTimeout(
          addFoodOrderEntry(
            productAmount,
            quantityToOrder,
            product_id,
            orderData.orderId
          ),
          5000
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error(
      `Error creating order for user ${user_id} with product ${product_id}:`,
      error
    );
    return { success: false, reason: "error" };
  }
};

const getProductById = async (product_id) => {
  const query = `
      SELECT f.price, f.discount_price
      FROM foods f
      WHERE f.id = ?;
    `;

  try {
    const [productRows]: [any[], any] = await db
      .promise()
      .query(query, [product_id]);
    return productRows;
  } catch (error) {
    console.error(`Error fetching product with ID ${product_id}:`, error);
    throw new Error("Error fetching product.");
  }
};

const addOrdersEntry = async (userId, currentDate) => {
  const addressSql = `
  SELECT da.id AS delivery_address_id, da.*, l.route_id, l.hub_id
  FROM delivery_addresses da
  LEFT JOIN localities l ON da.locality_id = l.id
  WHERE da.user_id = ?;
`;

  try {
    const [addressRows] = await db.promise().query(addressSql, [userId]);
    const addressData = addressRows[0];

    if (!addressData || !addressData.locality_id || !addressData.hub_id) {
      console.warn(
        `Skipping order creation for user ${userId} due to missing hub or locality.`
      );
      return null;
    }

    const { route_id, hub_id, locality_id, delivery_address_id } = addressData;

    const orderSql = `
        INSERT INTO orders (
          user_id, order_type, order_date, route_id, hub_id, locality_id, 
          order_status_id, tax, delivery_fee, delivery_address_id, is_wallet_deduct, 
          created_at, updated_at
        ) 
        VALUES (?, 2, ?, ?, ?, ?, 3, 0.0, 0.0, ?, 1, NOW(), NOW());
      `;

    const [orderResult]: any = await db
      .promise()
      .query(orderSql, [
        userId,
        currentDate,
        route_id,
        hub_id,
        locality_id,
        delivery_address_id,
      ]);

    if (!orderResult?.insertId) {
      console.error(`Order creation failed for user ${userId}.`);
      return null;
    }

    return {
      status: true,
      orderId: orderResult.insertId,
      message: "Order created successfully",
    };
  } catch (error) {
    console.error(`Error creating order for user ${userId}:`, error);
    throw new Error("Error creating order.");
  }
};

const addFoodOrderEntry = async (
  productAmount,
  quantity,
  productId,
  orderId
) => {
  const foodOrderSql = `
      INSERT INTO food_orders (
        price, quantity, food_id, order_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW());
    `;

  try {
    await db
      .promise()
      .query(foodOrderSql, [productAmount, quantity, productId, orderId]);
  } catch (error) {
    console.error(`Error creating food order for order ${orderId}:`, error);
    throw new Error("Error creating food order.");
  }
};

export const subcribtionsJob = () => {
  cron.schedule("30 21 * * *", async () => {
    console.log("Cron job running...");
    console.time("subProcessing");

    const currentDate = new Date();
    const nextDate = new Date(currentDate);
    
    nextDate.setDate(currentDate.getDate());

    const jobStartTime = moment().format("YYYY-MM-DD HH:mm:ss");
    let jobEndTime = "";
    let jobDuration = "";

    try {
      await handleNextDayOrders(currentDate);

      jobEndTime = moment().format("YYYY-MM-DD HH:mm:ss");
      jobDuration = moment(jobEndTime).diff(
        moment(jobStartTime),
        "seconds"
      ) as any;

      const logMessage = `Subscription orders placed for date ${
        nextDate.toISOString().split("T")[0]
      } and placed on ${currentDate.toLocaleString()}`;

      const sqlQuery = `
        INSERT INTO cron_logs (log_date, cron_logs, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `;
      const values = [
        nextDate.toISOString().split("T")[0],
        `Job Start: ${jobStartTime}, Job End: ${jobEndTime}, Duration: ${jobDuration}s, Message: ${logMessage}`,
      ];

      await db.promise().query(sqlQuery, values);

      console.timeEnd("subProcessing");
      console.log("Today's subscription processed successfully.");
    } catch (error) {
      console.error("Error running handleNextDayOrders:", error);
    }
  });
};

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
      const [result]: [OkPacket, any] = await db
        .promise()
        .query(sql, [currentDate]);
      console.log(
        `Updated ${result.affectedRows} subscriptions that reached their end date`
      );
    } catch (error) {
      console.error("Error updating subscriptions:", error);
    }
  });
};
