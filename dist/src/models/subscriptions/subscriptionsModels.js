"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionById = exports.deleteSubscriptionById = exports.updateSubscription = exports.addSubscription = exports.getAllSubscriptions = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all subscriptions for a user
const getAllSubscriptions = async (userId) => {
    const query = `SELECT * FROM subscriptions WHERE user_id = ?;`;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, [userId]);
    return rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        stripeId: row.stripe_id,
        stripeStatus: row.stripe_status,
        stripePrice: row.stripe_price,
        quantity: row.quantity,
        trialEndsAt: row.trial_ends_at,
        endsAt: row.ends_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
};
exports.getAllSubscriptions = getAllSubscriptions;
// Add a new subscription
const addSubscription = async (subscriptionData) => {
    const { userId, name, stripeId, stripeStatus, stripePrice, quantity } = subscriptionData;
    const sql = `
    INSERT INTO subscriptions (user_id, name, stripe_id, stripe_status, stripe_price, quantity, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const values = [userId, name, stripeId, stripeStatus, stripePrice, quantity];
    const [result] = await databaseConnection_1.db.promise().query(sql, values);
    return result; // Return the result to check for affected rows
};
exports.addSubscription = addSubscription;
// Update a subscription
const updateSubscription = async (id, subscriptionData) => {
    if (!subscriptionData.name || !subscriptionData.quantity) {
        throw new Error("Name and quantity are required fields.");
    }
    const sql = `
      UPDATE subscriptions
      SET name = ?, stripe_status = ?, quantity = ?, updated_at = NOW()
      WHERE id = ?;
    `;
    const values = [
        subscriptionData.name,
        subscriptionData.stripeStatus,
        subscriptionData.quantity,
        id
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result;
    }
    catch (error) {
        throw new Error(`Error updating subscription: ${error.message}`);
    }
};
exports.updateSubscription = updateSubscription;
// Delete a subscription by ID
const deleteSubscriptionById = async (id) => {
    const sql = `
    DELETE FROM subscriptions 
    WHERE id = ?;
  `;
    await databaseConnection_1.db.promise().query(sql, [id]);
};
exports.deleteSubscriptionById = deleteSubscriptionById;
// Get subscription by ID
const getSubscriptionById = async (id) => {
    const query = `SELECT * FROM subscriptions WHERE id = ?;`;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    // Map the row to the Subscription type if it exists
    return rows.length
        ? {
            id: rows[0].id,
            userId: rows[0].user_id,
            name: rows[0].name,
            stripeId: rows[0].stripe_id,
            stripeStatus: rows[0].stripe_status,
            stripePrice: rows[0].stripe_price,
            quantity: rows[0].quantity,
            trialEndsAt: rows[0].trial_ends_at,
            endsAt: rows[0].ends_at,
            createdAt: rows[0].created_at,
            updatedAt: rows[0].updated_at,
        }
        : null;
};
exports.getSubscriptionById = getSubscriptionById;
