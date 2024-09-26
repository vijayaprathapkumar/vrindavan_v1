"use strict";
// src/models/subscriptions/subscriptionsModels.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionGetByIdModel = exports.updateCancelSubscriptionModel = exports.getSubscriptionByIdModel = exports.resumeSubscriptionModel = exports.pauseSubscriptionModel = exports.deleteSubscriptionModel = exports.updateSubscriptionModel = exports.getTotalSubscriptionsCountModel = exports.getAllSubscriptionsModel = exports.addSubscriptionModel = void 0;
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
const getAllSubscriptionsModel = (userId, page, limit) => {
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?", [userId, limit, offset], (error, results) => {
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
        updated_at: new Date(), // Update timestamp
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
            resolve(results);
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
        databaseConnection_1.db.query("SELECT * FROM user_subscriptions WHERE id = ?", [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};
exports.getSubscriptionByIdModel = getSubscriptionByIdModel;
const updateCancelSubscriptionModel = (id, cancel_subscription) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET cancel_subscription = ?, updated_at = NOW() WHERE id = ?", [cancel_subscription, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
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
