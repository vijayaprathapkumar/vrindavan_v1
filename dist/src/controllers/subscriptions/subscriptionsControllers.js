"use strict";
// src/controllers/subscriptions/subscriptionsControllers.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionById = exports.cancelSubscription = exports.resumeSubscription = exports.pauseSubscription = exports.deleteSubscription = exports.updateSubscription = exports.getSubscriptions = exports.addSubscription = void 0;
const subscriptionsModels_1 = require("../../models/subscriptions/subscriptionsModels");
const responseHandler_1 = require("../../utils/responseHandler");
const validSubscriptionTypes = [
    "everyday",
    "alternative Day",
    "every 3rd day",
    "weekends",
    "customize",
];
const addSubscription = async (req, res) => {
    const subscription = req.body;
    // Check if subscription_type is valid
    if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid subscription type provided."));
    }
    try {
        const result = await (0, subscriptionsModels_1.addSubscriptionModel)(subscription);
        const user_subscription_id = result.insertId;
        const user_id = subscription.user_id;
        const quantity = subscription.quantity;
        const product_id = subscription.product_id;
        const start_date = subscription.start_date;
        const end_date = subscription.end_date;
        const cancel_subscription = subscription.cancel_subscription || 0;
        const pause_subscription = subscription.is_pause_subscription || false;
        let cancel_subscription_date = null;
        let pause_date = null;
        if (cancel_subscription === 1) {
            cancel_subscription_date = new Date();
        }
        if (pause_subscription) {
            pause_date = new Date();
        }
        await (0, subscriptionsModels_1.addSubscriptionQuantityChangeModel)(user_subscription_id, user_id, quantity, product_id, start_date, end_date, cancel_subscription, pause_subscription, null, pause_date, null, cancel_subscription_date);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Subscription created successfully.", { id: user_subscription_id }));
    }
    catch (error) {
        console.error("Error adding subscription:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to create subscription.", error.message));
    }
};
exports.addSubscription = addSubscription;
const getSubscriptions = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || "";
    if (isNaN(userId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid user ID."));
    }
    try {
        const totalRecords = await (0, subscriptionsModels_1.getTotalSubscriptionsCountModel)(userId);
        const totalPages = Math.ceil(totalRecords / limit);
        const subscriptions = await (0, subscriptionsModels_1.getAllSubscriptionsModel)(userId, page, limit, searchTerm);
        const response = {
            subscriptions,
            pagination: {
                totalRecords,
                currentPage: page,
                limit,
                totalPages,
            },
        };
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscriptions fetched successfully.", response));
    }
    catch (error) {
        console.error("Error fetching subscriptions:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch subscriptions.", error.message));
    }
};
exports.getSubscriptions = getSubscriptions;
const updateSubscription = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    const subscription = req.body;
    // Check if subscription_type is valid
    if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid subscription type provided."));
    }
    try {
        const result = await (0, subscriptionsModels_1.updateSubscriptionModel)(id, subscription);
        if (result.affectedRows === 0) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Subscription not found."));
        }
        // Update dates if pause or cancel is set
        if (subscription.cancel_subscription === 1 || subscription.is_pause_subscription) {
            const cancel_subscription_date = subscription.cancel_subscription === 1 ? new Date() : null;
            const pause_date = subscription.is_pause_subscription ? new Date() : null;
            // Update the subscription quantity change table
            await (0, subscriptionsModels_1.addSubscriptionQuantityChangeModel)(id, subscription.user_id, subscription.quantity, subscription.product_id, subscription.start_date, subscription.end_date, subscription.cancel_subscription, subscription.is_pause_subscription, null, pause_date, null, cancel_subscription_date);
        }
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Subscription updated successfully.", { id }));
    }
    catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update subscription.", error.message));
    }
};
exports.updateSubscription = updateSubscription;
const deleteSubscription = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    try {
        const result = await (0, subscriptionsModels_1.deleteSubscriptionModel)(id);
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Subscription not found."));
        }
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscription deleted successfully."));
    }
    catch (error) {
        console.error("Error deleting subscription:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to delete subscription.", error.message));
    }
};
exports.deleteSubscription = deleteSubscription;
const pauseSubscription = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    try {
        await (0, subscriptionsModels_1.pauseSubscriptionModel)(id);
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscription paused successfully.", { id }));
    }
    catch (error) {
        console.error("Error pausing subscription:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to pause subscription.", error.message));
    }
};
exports.pauseSubscription = pauseSubscription;
const resumeSubscription = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    try {
        await (0, subscriptionsModels_1.resumeSubscriptionModel)(id);
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscription resumed successfully.", { id }));
    }
    catch (error) {
        console.error("Error resuming subscription:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to resume subscription.", error.message));
    }
};
exports.resumeSubscription = resumeSubscription;
const cancelSubscription = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    try {
        const cancel_subscription = 1;
        const cancel_subscription_date = new Date();
        // Update subscription cancellation in both tables
        const result = await (0, subscriptionsModels_1.updateCancelSubscriptionModel)(id, cancel_subscription, cancel_subscription_date);
        if (result.affectedRows === 0) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Subscription not found."));
        }
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Subscription canceled successfully.", { id }));
    }
    catch (error) {
        console.error("Error canceling subscription:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to cancel subscription.", error.message));
    }
};
exports.cancelSubscription = cancelSubscription;
const getSubscriptionById = async (req, res) => {
    const id = parseInt(req.params.id);
    console.log("id", id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    try {
        const subscription = await (0, subscriptionsModels_1.getSubscriptionGetByIdModel)(id);
        if (!subscription) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Subscription not found."));
        }
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscription fetched successfully.", subscription));
    }
    catch (error) {
        console.error("Error fetching subscription by ID:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch subscription.", error.message));
    }
};
exports.getSubscriptionById = getSubscriptionById;
