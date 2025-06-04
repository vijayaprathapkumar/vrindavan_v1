import moment from "moment";
import { db } from "../../config/databaseConnection";
import { FieldPacket, OkPacket, RowDataPacket } from "mysql2";

async function fetchSubscriptions(batchSize, offset) {
  const [subscriptions]: [RowDataPacket[], FieldPacket[]] = await db
    .promise()
    .query(
      `SELECT * FROM user_subscriptions 
       WHERE user_id = ? AND active = 1 AND is_pause_subscription = 0 
       LIMIT ? OFFSET ?`,
      [12947, batchSize, offset]
    );
  return subscriptions;
}


// Handle the next day's orders based on user subscriptions
export async function handleNextDayOrdersDemo() {
  const tomorrow = moment().add(1, "days");
  const dayOfWeek = tomorrow.format("dddd").toLowerCase();
  let offset = 0;
  const batchSize = 100;

  while (true) {
    const subscriptions = await fetchSubscriptions(batchSize, offset);
    if (subscriptions.length === 0) break;

    const userOrders = {};

    for (const sub of subscriptions) {
      const userId = sub.user_id;
      let quantityToOrder = 0;

      if (sub.subscription_type === "everyday") {
        quantityToOrder = sub.quantity;
      } else if (sub.subscription_type === "alternative_day") {
        const lastOrderDate = moment(sub.last_order_date);
        if (tomorrow.diff(lastOrderDate, "days") % 2 === 0) {
          quantityToOrder = sub.quantity;
        }
      } else if (sub.subscription_type === "every_3_day") {
        const lastOrderDate = moment(sub.last_order_date);
        if (tomorrow.diff(lastOrderDate, "days") % 3 === 0) {
          quantityToOrder = sub.quantity;
        }
      } else if (sub.subscription_type === "every_7_day") {
        const lastOrderDate = moment(sub.last_order_date);
        if (tomorrow.diff(lastOrderDate, "days") % 7 === 0) {
          quantityToOrder = sub.quantity;
        }
      } else if (sub.subscription_type === "customize") {
        quantityToOrder = sub[`${dayOfWeek}Qty`];
      }

      if (quantityToOrder > 0) {
        if (!userOrders[userId]) {
          userOrders[userId] = {
            cartItems: [],
            totalPrice: 0,
          };
        }

        const cartItems = await getsubscriptionByUserId(userId);
        cartItems.forEach((item) => (item.quantity = quantityToOrder));
        userOrders[userId].cartItems.push(...cartItems);
      }
    }

    for (const userId in userOrders) {
      const { cartItems } = userOrders[userId];
      const totalPrice = await createOrder(userId, cartItems);
      try {
        await addSubscriptionsPlaceOrder({
          price: totalPrice,
          userId,
          status: "active",
          method: "wallet",
        });
      } catch (error) {
        console.error(`Error processing payment for user ${userId}:`, error);
      }
    }

    offset += batchSize;
  }
}

// Create an order based on subscription
export const createOrder = async (userId, cartItems) => {

  let totalPrice = 0;
  let orderId;

  try {
    orderId = await createOrderEntry(userId);

    console.log(
      `Order successfully created for user ${userId}. Order ID: ${orderId}`
    );
    for (const item of cartItems) {
      const finalPrice =
        item.foodDiscountPrice !== null && item.foodDiscountPrice !== undefined
          ? item.foodDiscountPrice
          : item.foodPrice;

      const existingFoodOrderSql = `
        SELECT * FROM food_orders
        WHERE order_id = ? AND food_id = ?;
      `;

      const [existingFoodOrders]: [RowDataPacket[], FieldPacket[]] = await db
        .promise()
        .query(existingFoodOrderSql, [orderId, item.food_id]);
      if (existingFoodOrders.length === 0) {
        const foodOrderSql = `
          INSERT INTO food_orders (
            price,
            quantity,
            food_id,
            order_id,
            created_at,
            updated_at
          ) 
          VALUES (?, ?, ?, ?, NOW(), NOW());
        `;

        const foodOrderValues = [
          finalPrice,
          item.quantity,
          item.food_id,
          orderId,
        ];
        await db.promise().query(foodOrderSql, foodOrderValues);
        totalPrice += finalPrice * item.quantity;
      } else {
        console.log(
          `Food item ${item.food_id} already exists for order ${orderId}. Skipping insertion.`
        );
      }
    }

    const [walletRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(`SELECT balance FROM wallet_balances WHERE user_id = ?`, [userId]);
    const beforeBalance = walletRows[0]?.balance;

    const deductionSuccess = await deductFromWalletBalance(userId, totalPrice);
    if (!deductionSuccess) {
      throw new Error("Failed to deduct from wallet balance.");
    }

    const afterBalance = (beforeBalance - totalPrice).toFixed(2);

    await logWalletTransaction(
      userId,
      orderId,
      beforeBalance,
      totalPrice,
      afterBalance,
      `Rs ${totalPrice} deducted for user ID ${userId}`
    );

    return totalPrice;
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

const createOrderEntry = async (userId) => {
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
      delivery_address_id,
      is_wallet_deduct, 
      created_at, 
      updated_at
    ) 
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;

  const orderValues = [
    userId,
    2, // Assuming order_type is 2
    route_id,
    hub_id,
    locality_id,
    null, // delivery_boy_id
    1, // order_status_id (active)
    0.0, // tax
    0.0, // delivery_fee
    delivery_address_id,
    1, // is_wallet_deduct
  ];

  const [orderResult]: [OkPacket, any] = await db
    .promise()
    .query(orderSql, orderValues);

  if (orderResult.affectedRows === 0) {
    throw new Error("Failed to create order.");
  }

  return orderResult.insertId;
};

// Get subscription details for a specific user
const getsubscriptionByUserId = async (userId, retries = 3) => {
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
export const addSubscriptionsPlaceOrder = async (placeOrderData) => {
  const { price, userId, status, method } = placeOrderData;

  const paymentSql = `
    INSERT INTO payments (price, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, NOW(), NOW());
  `;
  const paymentValues = [price, userId, status, method];

  try {
    const [paymentResult]: [OkPacket, any] = await db
      .promise()
      .query(paymentSql, paymentValues);

    if (paymentResult.affectedRows === 0) {
      throw new Error("Payment insertion failed.");
    }

    return paymentResult;
  } catch (error) {
    console.error("SQL Error in addSubscriptionsPlaceOrder:", error);
    throw new Error("Failed to add place order.");
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
