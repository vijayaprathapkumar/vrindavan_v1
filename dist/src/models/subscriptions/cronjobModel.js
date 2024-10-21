"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductFromWalletBalance = exports.insertIntoOrderPayment = exports.addSubscriptionsPlaceOrder = exports.createOrder = void 0;
exports.handleNextDayOrders = handleNextDayOrders;
const moment_1 = __importDefault(require("moment"));
const databaseConnection_1 = require("../../config/databaseConnection");
async function fetchSubscriptions(batchSize, offset) {
    const [subscriptions] = await databaseConnection_1.db
        .promise()
        .query(`SELECT * FROM user_subscriptions WHERE user_id = ? LIMIT ? OFFSET ?`, [
        12944,
        batchSize,
        offset,
    ]);
    return subscriptions;
}
// Handle the next day's orders based on user subscriptions
async function handleNextDayOrders() {
    const tomorrow = (0, moment_1.default)().add(1, "days");
    const dayOfWeek = tomorrow.format("dddd").toLowerCase();
    let offset = 0;
    const batchSize = 100;
    while (true) {
        const subscriptions = await fetchSubscriptions(batchSize, offset);
        if (subscriptions.length === 0)
            break;
        for (const sub of subscriptions) {
            let quantityToOrder = 0;
            // Determine quantity to order based on subscription type
            if (sub.subscription_type === "everyday") {
                quantityToOrder = sub.quantity;
            }
            else if (sub.subscription_type === "alternative_day") {
                const lastOrderDate = (0, moment_1.default)(sub.last_order_date);
                if (tomorrow.diff(lastOrderDate, "days") % 2 === 0) {
                    quantityToOrder = sub.quantity;
                }
            }
            else if (sub.subscription_type === "every_3_day") {
                const lastOrderDate = (0, moment_1.default)(sub.last_order_date);
                if (tomorrow.diff(lastOrderDate, "days") % 3 === 0) {
                    quantityToOrder = sub.quantity;
                }
            }
            else if (sub.subscription_type === "every_7_day") {
                const lastOrderDate = (0, moment_1.default)(sub.last_order_date);
                if (tomorrow.diff(lastOrderDate, "days") % 7 === 0) {
                    quantityToOrder = sub.quantity;
                }
            }
            else if (sub.subscription_type === "customize") {
                quantityToOrder = sub[`${dayOfWeek}Qty`];
            }
            if (quantityToOrder > 0) {
                try {
                    await (0, exports.createOrder)(sub); // Pass the subscription object
                }
                catch (error) {
                    console.error(`Error creating order for subscription ${sub.id}:`, error);
                }
            }
        }
        offset += batchSize;
    }
}
// Create an order based on subscription
const createOrder = async (subscription) => {
    const userId = subscription.user_id;
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
        const paymentResult = await (0, exports.addSubscriptionsPlaceOrder)({
            price: totalPrice,
            userId,
            status: "active",
            method: "wallet",
        });
        if (paymentResult.affectedRows === 0) {
            throw new Error(`Failed to add place order for user ${userId}`);
        }
        console.log(`Order successfully created for user ${userId} with payment ID: ${paymentResult.insertId}`);
    }
    catch (error) {
        console.error("Error creating order:", error);
    }
};
exports.createOrder = createOrder;
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
        const [subscriptionRows] = await databaseConnection_1.db
            .promise()
            .query(query, [userId]);
        return subscriptionRows;
    }
    catch (error) {
        console.error(`Error fetching subscriptions for user ${userId}:`, error);
        if (retries > 0 && error.code === "ETIMEDOUT") {
            console.log(`Retrying... Attempts left: ${retries}`);
            return getsubscriptionByUserId(userId, retries - 1);
        }
        else {
            throw new Error("Failed to fetch user subscriptions after multiple attempts.");
        }
    }
};
// Add a subscription place order
const addSubscriptionsPlaceOrder = async (placeOrderData) => {
    const { price, description, userId, status, method } = placeOrderData;
    const defaultDescription = description || `Default place order for user ${userId}`;
    const paymentSql = `
    INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const paymentValues = [price, defaultDescription, userId, status, method];
    try {
        const [paymentResult] = await databaseConnection_1.db
            .promise()
            .query(paymentSql, paymentValues);
        if (paymentResult.affectedRows === 0) {
            throw new Error("Payment insertion failed.");
        }
        const walletBalanceSql = `
      SELECT balance FROM wallet_balances WHERE user_id = ?;
    `;
        const [walletRows] = await databaseConnection_1.db
            .promise()
            .query(walletBalanceSql, [userId]);
        if (walletRows.length === 0) {
            throw new Error(`No wallet balance found for user ${userId}.`);
        }
        const beforeBalance = walletRows[0].balance;
        const afterBalance = (beforeBalance - price).toFixed(2);
        const deductionSuccess = await (0, exports.deductFromWalletBalance)(userId, price);
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
            null,
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
        const [addressRows] = await databaseConnection_1.db
            .promise()
            .query(addressSql, [userId]);
        if (addressRows.length === 0 ||
            !addressRows[0].locality_id ||
            !addressRows[0].hub_id) {
            throw new Error(`Missing locality or hub information for user ${userId}. Please add the correct address details.`);
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
            2, // Assuming order_type is 1
            route_id,
            hub_id,
            locality_id,
            null, // delivery_boy_id
            1, // order_status_id
            0.0, // tax
            0.0, // delivery_fee
            paymentResult.insertId,
            delivery_address_id,
            1, // is_wallet_deduct
        ];
        const [orderResult] = await databaseConnection_1.db
            .promise()
            .query(orderSql, orderValues);
        if (orderResult.affectedRows === 0) {
            throw new Error("Failed to create order.");
        }
        const orderId = orderResult.insertId;
        walletLogValues[1] = orderId;
        await databaseConnection_1.db.promise().query(walletLogSql, walletLogValues);
        const cartItems = await getsubscriptionByUserId(userId);
        // Insert into food_orders
        for (const item of cartItems) {
            console.log('item', item);
            const finalPrice = item.foodDiscountPrice !== null && item.foodDiscountPrice !== undefined
                ? item.foodDiscountPrice
                : item.foodPrice;
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
            const foodOrderValues = [finalPrice, item.quantity, item.food_id, orderId];
            await databaseConnection_1.db.promise().query(foodOrderSql, foodOrderValues);
        }
        await (0, exports.insertIntoOrderPayment)(userId, paymentResult.insertId);
        return paymentResult;
    }
    catch (error) {
        console.error("SQL Error in addPlaceOrder:", error);
        throw new Error("Failed to add place order.");
    }
};
exports.addSubscriptionsPlaceOrder = addSubscriptionsPlaceOrder;
const insertIntoOrderPayment = async (userId, paymentId) => {
    const orderSql = `
    UPDATE orders
    SET payment_id = ?, updated_at = NOW()
    WHERE user_id = ? AND order_status_id = 1;
  `;
    const orderValues = [paymentId, userId];
    try {
        const [result] = await databaseConnection_1.db
            .promise()
            .query(orderSql, orderValues);
        if (result.affectedRows === 0) {
            throw new Error("No active order found for the user to update.");
        }
    }
    catch (error) {
        console.error("SQL Error in insertIntoOrderPayment:", error);
        throw new Error("Failed to update order with payment details.");
    }
};
exports.insertIntoOrderPayment = insertIntoOrderPayment;
const deductFromWalletBalance = async (userId, amount) => {
    const sql = `
      UPDATE wallet_balances 
      SET balance = balance - ? 
      WHERE user_id = ?;
    `;
    try {
        const [result] = await databaseConnection_1.db
            .promise()
            .query(sql, [amount, userId]);
        if (result.affectedRows === 0) {
            throw new Error("Wallet balance not found for the user.");
        }
        return true;
    }
    catch (error) {
        console.error("Error updating wallet balance:", error);
        return false;
    }
};
exports.deductFromWalletBalance = deductFromWalletBalance;
