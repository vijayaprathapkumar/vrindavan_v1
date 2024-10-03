"use strict";
// src/models/subscriptions/subscriptionsModels.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionGetByIdModel = exports.updateCancelSubscriptionModel = exports.getSubscriptionByIdModel = exports.resumeSubscriptionModel = exports.pauseSubscriptionModel = exports.deleteSubscriptionModel = exports.updateSubscriptionModel = exports.getTotalSubscriptionsCountModel = exports.getAllSubscriptionsModel = exports.addSubscriptionQuantityChangeModel = exports.addSubscriptionModel = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
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
              foods.food_locality, 
              foods.image
      FROM user_subscriptions 
      LEFT JOIN foods ON user_subscriptions.product_id = foods.id 
      WHERE user_subscriptions.user_id = ? 
    `;
        if (searchQuery) {
            query += ` AND foods.name LIKE ?`;
        }
        query += ` ORDER BY user_subscriptions.created_at DESC LIMIT ?, ?`;
        const params = searchQuery
            ? [userId, searchQuery, offset, limit]
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
              foods.food_locality, foods.image
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
