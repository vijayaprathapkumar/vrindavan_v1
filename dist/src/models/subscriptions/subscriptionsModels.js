"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionPauseInfo = exports.getSubscriptionGetByIdModel = exports.updateCancelSubscriptionModel = exports.getSubscriptionByIdModel = exports.resumeSubscriptionModel = exports.pauseSubscriptionModel = exports.deleteSubscriptionModel = exports.updateSubscriptionModel = exports.getTotalSubscriptionsCountModel = exports.getAllSubscriptionsModel = exports.addSubscriptionQuantityChangeModel = exports.addSubscriptionModel = void 0;
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
// Function to create an order based on subscription
const createOrder = (subscription) => {
    const { user_id, order_type, route_id, hub_id, locality_id, delivery_boy_id, order_status_id, tax = 0.00, delivery_fee = 0.00, hint, active = 1, driver_id, delivery_address_id, payment_id, is_wallet_deduct = 0, delivery_status = 0 } = subscription;
    const query = `INSERT INTO orders 
    (user_id, order_type, order_date, route_id, hub_id, locality_id, delivery_boy_id, order_status_id, 
    tax, delivery_fee, hint, active, driver_id, delivery_address_id, payment_id, is_wallet_deduct, 
    delivery_status, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
        user_id,
        order_type,
        new Date(),
        route_id,
        hub_id,
        locality_id,
        delivery_boy_id,
        order_status_id,
        tax,
        delivery_fee,
        hint,
        active,
        driver_id,
        delivery_address_id,
        payment_id,
        is_wallet_deduct,
        delivery_status
    ];
    databaseConnection_1.db.query(query, values, (err, result) => {
        if (err)
            throw err;
        // Accessing insertId from the result
        const orderId = result.insertId;
        console.log(`Order created for user ${user_id} with order ID: ${orderId}`);
    });
};
// Cron job for "everyday"
node_cron_1.default.schedule('0 0 * * *', () => {
    console.log('Running everyday subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'everyday'`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err)
            throw err;
        if (Array.isArray(results)) {
            results.forEach(subscription => createOrder(subscription));
        }
    });
});
// Cron job for "alternative Day" (runs every other day)
node_cron_1.default.schedule('0 0 */2 * *', () => {
    console.log('Running alternative day subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'alternative Day'`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err)
            throw err;
        if (Array.isArray(results)) {
            results.forEach(subscription => createOrder(subscription));
        }
    });
});
// Cron job for "every 3rd day"
node_cron_1.default.schedule('0 0 */3 * *', () => {
    console.log('Running every 3rd day subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'every 3rd day'`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err)
            throw err;
        if (Array.isArray(results)) {
            results.forEach(subscription => createOrder(subscription));
        }
    });
});
// Cron job for "weekends" (runs every Saturday and Sunday)
node_cron_1.default.schedule('0 0 * * 6,0', () => {
    console.log('Running weekends subscription job...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'weekends'`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err)
            throw err;
        if (Array.isArray(results)) {
            results.forEach(subscription => createOrder(subscription));
        }
    });
});
// Cron job for "customize" (this could be handled based on specific user preferences)
const handleCustomizeSubscriptions = () => {
    console.log('Handling customize subscriptions...');
    const query = `SELECT * FROM user_subscriptions WHERE subscription_type = 'customize'`;
    databaseConnection_1.db.query(query, (err, results) => {
        if (err)
            throw err;
        if (Array.isArray(results)) {
            results.forEach(subscription => {
                if (isTodayMatchingCustomSchedule(subscription.custom_schedule)) {
                    createOrder(subscription);
                }
            });
        }
    });
};
// Check if today matches the user's custom schedule
const isTodayMatchingCustomSchedule = (customSchedule) => {
    // Assuming customSchedule is an array of days, e.g., ["Monday", "Wednesday"]
    const today = new Date().toLocaleString('en-us', { weekday: 'long' });
    return customSchedule.includes(today);
};
// Customize cron job can be run daily and will handle orders based on user preferences
node_cron_1.default.schedule('0 0 * * *', () => {
    handleCustomizeSubscriptions();
});
