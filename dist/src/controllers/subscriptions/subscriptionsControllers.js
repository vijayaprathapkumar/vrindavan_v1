"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionPauseController = exports.getSubscriptionById = exports.cancelSubscription = exports.resumeSubscription = exports.pauseSubscription = exports.deleteSubscription = exports.updateSubscription = exports.getSubscriptions = exports.addSubscription = void 0;
const subscriptionsModels_1 = require("../../models/subscriptions/subscriptionsModels");
const responseHandler_1 = require("../../utils/responseHandler");
const validSubscriptionTypes = [
    "everyday",
    "alternative_day",
    "every_3_day",
    "every_7_day",
    "customize",
];
// Add Subscription
const addSubscription = async (req, res) => {
    const subscription = req.body;
    if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription type."));
    }
    try {
        const result = await (0, subscriptionsModels_1.addSubscriptionModel)(subscription);
        const user_subscription_id = result.insertId;
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Subscription created successfully.", {
            id: user_subscription_id,
        }));
    }
    catch (error) {
        console.error("Error adding subscription:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to create subscription.", error.message));
    }
};
exports.addSubscription = addSubscription;
// Fetch Subscriptions
const getSubscriptions = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || "";
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : undefined;
    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : undefined;
    if (isNaN(userId)) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid user ID."));
    }
    try {
        const totalCount = await (0, subscriptionsModels_1.getTotalSubscriptionsCountModel)(userId);
        const totalPages = Math.ceil(totalCount / limit);
        const subscriptions = await (0, subscriptionsModels_1.getAllSubscriptionsModel)(userId, page, limit, searchTerm, startDate, endDate);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Subscriptions fetched successfully.", {
            subscriptions,
            totalCount,
            currentPage: page,
            limit,
            totalPages,
        }));
    }
    catch (error) {
        console.error("Error fetching subscriptions:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch subscriptions.", error.message));
    }
};
exports.getSubscriptions = getSubscriptions;
// Update Subscription
const updateSubscription = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    const subscription = req.body;
    if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription type."));
    }
    try {
        const result = await (0, subscriptionsModels_1.updateSubscriptionModel)(id, subscription);
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Subscription not found."));
        }
        if (subscription.cancel_subscription === 1 ||
            subscription.is_pause_subscription) {
            const cancel_subscription_date = subscription.cancel_subscription === 1 ? new Date() : null;
            const pause_date = subscription.is_pause_subscription ? new Date() : null;
            await (0, subscriptionsModels_1.addSubscriptionQuantityChangeModel)(id, subscription.user_id, subscription.quantity, subscription.product_id, subscription.start_date, subscription.end_date, subscription.cancel_subscription, subscription.is_pause_subscription, null, pause_date, null, cancel_subscription_date);
        }
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscription updated successfully.", { id }));
    }
    catch (error) {
        console.error("Error updating subscription:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to update subscription.", error.message));
    }
};
exports.updateSubscription = updateSubscription;
// Delete Subscription
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
// Pause Subscription
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
// Resume Subscription
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
// Cancel Subscription
const cancelSubscription = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Invalid subscription ID."));
    }
    try {
        const cancel_subscription = 1;
        const cancel_subscription_date = new Date();
        const result = await (0, subscriptionsModels_1.updateCancelSubscriptionModel)(id, cancel_subscription, cancel_subscription_date);
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "Subscription not found."));
        }
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscription canceled successfully.", { id }));
    }
    catch (error) {
        console.error("Error canceling subscription:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to cancel subscription.", error.message));
    }
};
exports.cancelSubscription = cancelSubscription;
// Get Subscription by ID
const getSubscriptionById = async (req, res) => {
    const id = parseInt(req.params.id);
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
        const response = { subscription: [subscription] };
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Subscription fetched successfully.", response));
    }
    catch (error) {
        console.error("Error fetching subscription:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to fetch subscription.", error.message));
    }
};
exports.getSubscriptionById = getSubscriptionById;
// Update Subscription Pause Info
const updateSubscriptionPauseController = async (req, res) => {
    const { user_id, is_pause_subscription, pause_start_time, pause_end_time, pause_until_come_back, } = req.body;
    try {
        await (0, subscriptionsModels_1.updateSubscriptionPauseInfo)(user_id, is_pause_subscription, pause_until_come_back, pause_start_time, pause_end_time);
        res
            .status(200)
            .json((0, responseHandler_1.createResponse)(200, "Pause info updated successfully."));
    }
    catch (error) {
        console.error("Error updating subscription pause info:", error);
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to update pause info.", error.message));
    }
};
exports.updateSubscriptionPauseController = updateSubscriptionPauseController;
