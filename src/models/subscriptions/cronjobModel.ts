import moment from "moment";
import cron from "node-cron";
import { db } from "../../config/databaseConnection";
import { FieldPacket, OkPacket, RowDataPacket } from "mysql2";

async function fetchSubscriptions(batchSize, offset) {
  const [subscriptions]: [RowDataPacket[], FieldPacket[]] = await db
    .promise()
    .query(`SELECT * FROM user_subscriptions WHERE user_id = ? LIMIT ? OFFSET ?`, [
      12930, 
      batchSize,
      offset,
    ]);
  return subscriptions;
}

// Handle the next day's orders based on user subscriptions
export async function handleNextDayOrders() {
  const tomorrow = moment().add(1, "days");
  const dayOfWeek = tomorrow.format("dddd").toLowerCase();

  let offset = 0;
  const batchSize = 100;

  while (true) {
    const subscriptions = await fetchSubscriptions(batchSize, offset);
    if (subscriptions.length === 0) break;

    for (const sub of subscriptions) {
      let quantityToOrder = 0;

      // Determine quantity to order based on subscription type
      if (sub.subscription_type === "everyday") {
        quantityToOrder = sub.quantity;
      } else if (sub.subscription_type === "alternative day") {
        const lastOrderDate = moment(sub.last_order_date);
        if (tomorrow.diff(lastOrderDate, "days") % 2 === 0) {
          quantityToOrder = sub.quantity;
        }
      } else if (sub.subscription_type === "every 3rd day") {
        const lastOrderDate = moment(sub.last_order_date);
        if (tomorrow.diff(lastOrderDate, "days") % 3 === 0) {
          quantityToOrder = sub.quantity;
        }
      } else if (
        sub.subscription_type === "weekends" &&
        (dayOfWeek === "saturday" || dayOfWeek === "sunday")
      ) {
        quantityToOrder = sub.quantity;
      } else if (sub.subscription_type === "customize") {
        quantityToOrder = sub[`${dayOfWeek}Qty`];
      }

      if (quantityToOrder > 0) {
        try {
          await createOrder(sub); // Pass the subscription object
        } catch (error) {
          console.error(
            `Error creating order for subscription ${sub.id}:`,
            error
          );
        }
      }
    }

    offset += batchSize;
  }
}

// Create an order based on subscription
export const createOrder = async (subscription: any) => {
  const userId = subscription.user_id; // Get user ID from the subscription
  console.log("Creating order for user:", userId);
  
  try {
    const cartItems = await getsubscriptionByUserId(userId);

    if (!cartItems.length) {
      throw new Error("No items in subscription for user " + userId);
    }

    // Calculate total price
    const totalPrice = cartItems.reduce((total, item) => {
      const itemPrice = item.foodDiscountPrice || item.foodPrice;
      return total + itemPrice * item.quantity;
    }, 0);

    const paymentResult = await addSubscriptionsPlaceOrder({
      price: totalPrice,
      userId,
      status: "active",
      method: "wallet",
    });

    if (paymentResult.affectedRows === 0) {
      throw new Error(`Failed to add place order for user ${userId}`);
    }

    console.log(
      `Order successfully created for user ${userId} with payment ID: ${paymentResult.insertId}`
    );
  } catch (error) {
    console.error("Error creating order:", error);
  }
};

// Get subscription details for a specific user
const getsubscriptionByUserId = async (userId: number, retries = 3) => {
  const query = `
       SELECT us.*, f.id AS food_id,
        f.name AS food_name,
        f.price AS foodPrice,
        f.discount_price AS foodDiscountPrice,
        f.description,
        f.perma_link,
        f.ingredients,
        f.package_items_count,
        f.weight,
        f.unit,
        f.sku_code,
        f.barcode,
        f.cgst,
        f.sgst,
        f.track_inventory,
        f.featured,
        f.deliverable,
        f.restaurant_id,
        f.category_id,
        f.subcategory_id,
        f.product_type_id,
        f.hub_id,
        f.locality_id,
        f.product_brand_id,
        f.weightage,
        f.status,
        f.food_locality
        FROM user_subscriptions us
        JOIN foods f ON us.product_id = f.id
        WHERE us.user_id = ?;
    `;

  try {
    const [subscriptionRows]: [any[], any] = await db
      .promise()
      .query(query, [userId]);
    return subscriptionRows;
  } catch (error) {
    console.error(`Error fetching subscriptions for user ${userId}:`, error);

    if (retries > 0 && error.code === "ETIMEDOUT") {
      console.log(`Retrying... Attempts left: ${retries}`);
      return getsubscriptionByUserId(userId, retries - 1);
    } else {
      throw new Error(
        "Failed to fetch user subscriptions after multiple attempts."
      );
    }
  }
};

// Add a subscription place order
export const addSubscriptionsPlaceOrder = async (placeOrderData: {
  price: number;
  description?: string;
  userId: number;
  status: string;
  method: string;
}) => {
  const { price, description, userId, status, method } = placeOrderData;
  const defaultDescription =
    description || `Default place order for user ${userId}`;

  // Insert payment record
  const paymentSql = `
      INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW());
    `;

  const paymentValues = [price, defaultDescription, userId, status, method];

  try {
    const [paymentResult]: [OkPacket, any] = await db
      .promise()
      .query(paymentSql, paymentValues);

    if (paymentResult.affectedRows === 0) {
      throw new Error("Payment insertion failed.");
    }

    const walletBalanceSql = `
        SELECT balance FROM wallet_balances WHERE user_id = ?;
      `;

    const [walletRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(walletBalanceSql, [userId]);

    if (walletRows.length === 0) {
      throw new Error(`No wallet balance found for user ${userId}.`);
    }

    const beforeBalance = walletRows[0].balance;
    const afterBalance = (beforeBalance - price).toFixed(2);

    const deductionSuccess = await deductFromWalletBalance(userId, price);
    if (!deductionSuccess) {
      throw new Error("Failed to deduct from wallet balance.");
    }

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
      null, // order_id will be updated later
      paymentResult.insertId,
      beforeBalance,
      price,
      afterBalance,
      "deduction",
      `Rs ${price} deducted from Rs ${beforeBalance}`,
    ];

    const addressSql = `
        SELECT da.id AS delivery_address_id, da.*, l.route_id, l.hub_id, l.name AS locality_name
        FROM delivery_addresses da
        LEFT JOIN localities l ON da.locality_id = l.id
        WHERE da.user_id = ?;
      `;

    const [addressRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(addressSql, [userId]);

    if (
      addressRows.length === 0 ||
      !addressRows[0].locality_id ||
      !addressRows[0].hub_id
    ) {
      throw new Error(
        `Missing locality or hub information for user ${userId}. Please add the correct address details.`
      );
    }

    const addressData = addressRows[0];
    const { route_id, hub_id, locality_id, delivery_address_id } = addressData;

    const orderSql = `
        INSERT INTO orders (
          user_id, 
          order_type, 
          order_date, 
          route_id, 
          hub_id, 
          locality_id, 
          delivery_boy_id, 
          order_status_id, 
          tax, 
          delivery_fee, 
          payment_id, 
          delivery_address_id,
          is_wallet_deduct, 
          created_at, 
          updated_at
        ) 
        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
      `;

    const orderValues = [
      userId,
      2,
      route_id,
      hub_id,
      locality_id,
      null,
      1,
      0.0,
      0.0,
      paymentResult.insertId,
      delivery_address_id,
      1,
    ];

    const [orderResult]: [OkPacket, any] = await db
      .promise()
      .query(orderSql, orderValues);

    if (orderResult.affectedRows === 0) {
      throw new Error("Failed to create order.");
    }

    // Update wallet log with order ID
    await db
      .promise()
      .query(`UPDATE wallet_logs SET order_id = ? WHERE order_item_id = ?`, [
        orderResult.insertId,
        paymentResult.insertId,
      ]);

    console.log(`Order created successfully with ID: ${orderResult.insertId}`);
    return orderResult;
  } catch (error) {
    console.error("Error in addSubscriptionsPlaceOrder:", error);
    throw error; // Rethrow error for higher-level handling
  }
}

export const deductFromWalletBalance = async (
  userId: number,
  amount: number
): Promise<boolean> => {
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
