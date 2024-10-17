"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.deductFromWalletBalance = exports.insertIntoOrderPayment = exports.addSubscriptionsPlaceOrder = exports.updateSubscriptionPauseInfo = exports.getSubscriptionGetByIdModel = exports.updateCancelSubscriptionModel = exports.getSubscriptionByIdModel = exports.resumeSubscriptionModel = exports.pauseSubscriptionModel = exports.deleteSubscriptionModel = exports.updateSubscriptionModel = exports.getTotalSubscriptionsCountModel = exports.getAllSubscriptionsModel = exports.addSubscriptionQuantityChangeModel = exports.addSubscriptionModel = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const node_cron_1 = __importDefault(require("node-cron"));
const addSubscriptionModel = (subscription) => {
    const newSubscription = {
        ...subscription,
        created_at: new Date(),
        updated_at: new Date(),
    };
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("INSERT INTO user_subscriptions SET ?", [newSubscription], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.addSubscriptionModel = addSubscriptionModel;
const addSubscriptionQuantityChangeModel = (user_subscription_id, user_id, quantity, product_id, start_date, end_date, cancel_subscription, pause_subscription, order_date = null, pause_date = null, cancel_order_date = null, cancel_subscription_date = null, cancel_order = null, today_order = null, previous_order = null) => {
    return new Promise((resolve, reject) => {
        const changeData = {
            user_subscription_id,
            order_type: 2,
            user_id,
            product_id,
            quantity,
            order_date: order_date || null,
            start_date: start_date || null,
            end_date: end_date || null,
            cancel_subscription: cancel_subscription || null,
            pause_date: pause_subscription ? pause_date : null,
            cancel_order_date: cancel_order_date || null,
            cancel_subscription_date: cancel_subscription_date || null,
            cancel_order: cancel_order || null,
            today_order: today_order || null,
            previous_order: previous_order || null,
            pause_subscription: pause_subscription ? "1" : "0",
            reason: null,
            other_reason: null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        databaseConnection_1.db.query("INSERT INTO subscription_quantity_changes SET ?", [changeData], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.addSubscriptionQuantityChangeModel = addSubscriptionQuantityChangeModel;
const getAllSubscriptionsModel = (userId, page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    const searchQuery = searchTerm ? `%${searchTerm}%` : null;
    return new Promise((resolve, reject) => {
        let query = `
      SELECT user_subscriptions.*, 
              foods.id as food_id, 
              foods.name, 
              foods.price, 
              foods.discount_price, 
              foods.description, 
              foods.perma_link, 
              foods.ingredients, 
              foods.package_items_count, 
              foods.weight, 
              foods.unit, 
              foods.sku_code, 
              foods.barcode, 
              foods.cgst, 
              foods.sgst, 
              foods.subscription_type, 
              foods.track_inventory, 
              foods.featured, 
              foods.deliverable, 
              foods.restaurant_id, 
              foods.category_id, 
              foods.subcategory_id, 
              foods.product_type_id, 
              foods.hub_id, 
              foods.locality_id, 
              foods.product_brand_id, 
              foods.weightage, 
              foods.status, 
              foods.created_at, 
              foods.updated_at, 
              foods.food_locality
      FROM user_subscriptions 
      LEFT JOIN foods ON user_subscriptions.product_id = foods.id 
      WHERE user_subscriptions.user_id = ? 
    `;
        if (searchQuery) {
            query += ` AND (foods.name LIKE ? 
                OR foods.unit LIKE ? 
                OR foods.status LIKE ? 
                OR foods.weightage LIKE ? 
                OR foods.description LIKE ?)`;
        }
        query += ` ORDER BY user_subscriptions.created_at DESC LIMIT ?, ?`;
        const params = searchQuery
            ? [userId, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, offset, limit]
            : [userId, offset, limit];
        databaseConnection_1.db.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.getAllSubscriptionsModel = getAllSubscriptionsModel;
const getTotalSubscriptionsCountModel = (userId) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("SELECT COUNT(*) as count FROM user_subscriptions WHERE user_id = ?", [userId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0].count);
        });
    });
};
exports.getTotalSubscriptionsCountModel = getTotalSubscriptionsCountModel;
const updateSubscriptionModel = (id, subscription) => {
    const updatedSubscription = {
        ...subscription,
        updated_at: new Date(),
    };
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET ? WHERE id = ?", [updatedSubscription, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.updateSubscriptionModel = updateSubscriptionModel;
// Model to delete a subscription by ID
const deleteSubscriptionModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("DELETE FROM user_subscriptions WHERE id = ?", [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.deleteSubscriptionModel = deleteSubscriptionModel;
// Model to pause a subscription by ID
const pauseSubscriptionModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET is_pause_subscription = 1 WHERE id = ?", [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            const pauseDate = new Date();
            databaseConnection_1.db.query("UPDATE subscription_quantity_changes SET pause_subscription=1, pause_date = ?, updated_at = NOW() WHERE user_subscription_id = ?", [pauseDate, id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};
exports.pauseSubscriptionModel = pauseSubscriptionModel;
// Model to resume a subscription by ID
const resumeSubscriptionModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET is_pause_subscription = 0 WHERE id = ?", [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.resumeSubscriptionModel = resumeSubscriptionModel;
// Model to get a subscription by ID
const getSubscriptionByIdModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(`SELECT user_subscriptions.*, 
              foods.id as food_id, foods.name, foods.price, foods.discount_price, 
              foods.description, foods.perma_link, foods.ingredients, 
              foods.package_items_count, foods.weight, foods.unit, foods.sku_code, 
              foods.barcode, foods.cgst, foods.sgst, foods.subscription_type, 
              foods.track_inventory, foods.featured, foods.deliverable, 
              foods.restaurant_id, foods.category_id, foods.subcategory_id, 
              foods.product_type_id, foods.hub_id, foods.locality_id, 
              foods.product_brand_id, foods.weightage, foods.status, 
              foods.created_at as food_created_at, foods.updated_at as food_updated_at, 
              foods.food_locality
      FROM user_subscriptions
      JOIN foods ON user_subscriptions.product_id = foods.id
      WHERE user_subscriptions.id = ?`, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};
exports.getSubscriptionByIdModel = getSubscriptionByIdModel;
const updateCancelSubscriptionModel = (id, cancel_subscription, cancel_subscription_date) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET cancel_subscription = ?, updated_at = NOW() WHERE id = ?", [cancel_subscription, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            databaseConnection_1.db.query("UPDATE subscription_quantity_changes SET cancel_subscription = ?, cancel_subscription_date = ?, updated_at = NOW() WHERE user_subscription_id = ?", [cancel_subscription, cancel_subscription_date, id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};
exports.updateCancelSubscriptionModel = updateCancelSubscriptionModel;
const getSubscriptionGetByIdModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("SELECT * FROM user_subscriptions WHERE id = ?", [id], (error, results) => {
            if (error) {
                console.log("Query Results:", error);
                return reject(error);
            }
            console.log("Query Results:", results);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};
exports.getSubscriptionGetByIdModel = getSubscriptionGetByIdModel;
const updateSubscriptionPauseInfo = async (userId, isPauseSubscription, pauseUntilComeBack, startDate, endDate) => {
    const shouldPause = pauseUntilComeBack === 1 || startDate || endDate;
    isPauseSubscription = shouldPause ? 1 : 0;
    let sql = `
    UPDATE user_subscriptions 
    SET 
      is_pause_subscription = ?,
      pause_until_i_come_back = ?, 
      pause_specific_period_startDate = ?, 
      pause_specific_period_endDate = ? 
    WHERE user_id = ?;
  `;
    const values = [
        isPauseSubscription,
        pauseUntilComeBack || 0,
        startDate || null,
        endDate || null,
        userId,
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result;
    }
    catch (error) {
        console.error("Error updating subscription pause info:", error);
        throw new Error("Failed to update subscription pause information.");
    }
};
exports.updateSubscriptionPauseInfo = updateSubscriptionPauseInfo;
// cron job pause subscription 
node_cron_1.default.schedule('0 0 * * *', async () => {
    const currentDate = new Date().toISOString();
    console.log('currentDate', currentDate);
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
        const [result] = await databaseConnection_1.db.promise().query(sql, [currentDate]);
        console.log(`Updated ${result.affectedRows} subscriptions that reached their end date`);
    }
    catch (error) {
        console.error("Error updating subscriptions:", error);
    }
});
const addSubscriptionsPlaceOrder = async (placeOrderData) => {
    const { price, description, userId, status, method } = placeOrderData;
    const defaultDescription = description || `Default place order for user ${userId}`;
    // Insert payment record
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
            null, // order_id will be updated later
            paymentResult.insertId,
            beforeBalance,
            price,
            afterBalance,
            'deduction',
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
        for (const item of cartItems) {
            const logSql = `
        INSERT INTO order_logs (
          order_date, 
          user_id, 
          order_id, 
          product_id, 
          locality_id, 
          delivery_boy_id, 
          is_created, 
          logs, 
          created_at, 
          updated_at
        ) 
        VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
      `;
            const logValues = [
                userId,
                orderId,
                item.food_id,
                locality_id,
                null,
                1,
                "Stock Available, Order Created",
            ];
            await databaseConnection_1.db.promise().query(logSql, logValues);
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
//cron job subscription
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
        const [subscriptionRows] = await databaseConnection_1.db.promise().query(query, [userId]);
        return subscriptionRows;
    }
    catch (error) {
        console.error(`Error fetching subscriptions for user ${userId}:`, error);
        if (retries > 0 && error.code === 'ETIMEDOUT') {
            console.log(`Retrying... Attempts left: ${retries}`);
            return getsubscriptionByUserId(userId, retries - 1);
        }
        else {
            throw new Error("Failed to fetch user subscriptions after multiple attempts.");
        }
    }
};
// Function to create an order
const isSubscriptionPaused = (subscription) => {
    const today = new Date();
    if (subscription.is_pause_subscription === 1 && subscription.pause_until_i_come_back === 1) {
        return true;
    }
    if (subscription.is_pause_subscription === 1 && subscription.pause_specific_period_startDate && subscription.pause_specific_period_endDate) {
        const startDate = new Date(subscription.pause_specific_period_startDate);
        const endDate = new Date(subscription.pause_specific_period_endDate);
        if (today >= startDate && today <= endDate) {
            return true;
        }
    }
    return false;
};
const createOrder = async (subscription) => {
    const userId = subscription.user_id;
    // console.log('Creating order for user:', userId);
    try {
        if (isSubscriptionPaused(subscription)) {
            console.log(`Skipping order creation for paused subscription ${subscription.id}.`);
            return;
        }
        const cartItems = await getsubscriptionByUserId(userId);
        if (!cartItems.length) {
            throw new Error("No items in subscription for user " + userId);
        }
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
        // console.log(`Order successfully created for user ${userId} with payment ID: ${paymentResult.insertId}`);
    }
    catch (error) {
        console.error("Error creating order:", error);
    }
};
exports.createOrder = createOrder;
// Cron job for "everyday"
node_cron_1.default.schedule('0 0 * * *', () => {
    console.log('Running everyday subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'everyday' AND active = 1`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching everyday subscriptions:', err);
            return;
        }
        if (Array.isArray(results)) {
            results.forEach(subscription => (0, exports.createOrder)(subscription));
        }
    });
});
// Cron job for "alternative Day"
node_cron_1.default.schedule('0 0 */2 * *', () => {
    console.log('Running alternative day subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'alternative Day' AND active = 1`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching alternative day subscriptions:', err);
            return;
        }
        if (Array.isArray(results)) {
            results.forEach(subscription => (0, exports.createOrder)(subscription));
        }
    });
});
// Cron job for "every 3rd day"
node_cron_1.default.schedule('0 0 */3 * *', () => {
    console.log('Running every 3rd day subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'every 3rd day' AND active = 1`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching every 3rd day subscriptions:', err);
            return;
        }
        if (Array.isArray(results)) {
            results.forEach(subscription => (0, exports.createOrder)(subscription));
        }
    });
});
// Cron job for "weekends"
node_cron_1.default.schedule('0 0 * * 6,0', () => {
    console.log('Running weekends subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'weekends' AND active = 1`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching weekends subscriptions:', err);
            return;
        }
        if (Array.isArray(results)) {
            results.forEach(subscription => (0, exports.createOrder)(subscription));
        }
    });
});
// Custom subscriptions with pause check
const handleCustomizeSubscriptions = () => {
    console.log('Handling customize subscriptions...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'customize' AND active = 1`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching customize subscriptions:', err);
            return;
        }
        if (Array.isArray(results)) {
            results.forEach(subscription => {
                if (!isSubscriptionPaused(subscription)) {
                    const customSchedule = JSON.parse(subscription.custom_schedule);
                    if (isTodayMatchingCustomSchedule(customSchedule)) {
                        (0, exports.createOrder)(subscription);
                    }
                }
            });
        }
    });
};
// Check if today matches the user's custom schedule
const isTodayMatchingCustomSchedule = (customSchedule) => {
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    return customSchedule.includes(today);
};
// Schedule the customize check every day at midnight
node_cron_1.default.schedule('0 0 * * *', () => {
    handleCustomizeSubscriptions();
});
//testing
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// const fetchEverydaySubscriptions = async (retries = 3) => {
//   const query = `
//     SELECT * 
//     FROM user_subscriptions 
//     WHERE subscription_type = 'everyday' 
//       AND active = 1;
//   `;
//   return new Promise((resolve, reject) => {
//     db.query(query, async (err, results) => {
//       if (err) {
//         if (retries > 0 && err.code === 'ETIMEDOUT') {
//           console.log(`Retrying... Attempts left: ${retries}`);
//           await delay(1000); // Delay between retries
//           return resolve(fetchEverydaySubscriptions(retries - 1)); // Retry logic
//         }
//         return reject(err); // Reject if no retries left or a different error
//       }
//       resolve(results);
//     });
//   });
// };
// cron.schedule('34 15 * * *', async () => {
//   console.log('Running the job for all active everyday subscriptions...');
//   try {
//     const subscriptionResults = await fetchEverydaySubscriptions();
//     if (Array.isArray(subscriptionResults)) {
//       for (const subscription of subscriptionResults) {
//         try {
//           await createOrder(subscription);
//           console.log(`Order created successfully for user ${subscription.user_id}.`);
//         } catch (error) {
//           console.error(`Error creating order for user ${subscription.user_id}:`, error.message);
//         }
//         await delay(500); // Optional: Delay to avoid server load spikes
//       }
//       console.log("All active everyday subscription orders have been processed.");
//     }
//   } catch (error) {
//     console.error('Error fetching everyday subscriptions:', error);
//   }
// });
