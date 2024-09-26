"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSubscriptionById = exports.removeSubscription = exports.updateExistingSubscription = exports.addNewSubscription = exports.fetchSubscriptions = void 0;
const subscriptionsModels_1 = require("../../models/subscriptions/subscriptionsModels");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all subscriptions for a user
const fetchSubscriptions = async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const subscriptions = await (0, subscriptionsModels_1.getAllSubscriptions)(userId);
        res.json((0, responseHandler_1.createResponse)(200, "Subscriptions fetched successfully.", subscriptions));
    }
    catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch subscriptions."));
    }
};
exports.fetchSubscriptions = fetchSubscriptions;
// Add a new subscription
const addNewSubscription = async (req, res) => {
    const subscriptionData = req.body;
    try {
        const result = await (0, subscriptionsModels_1.addSubscription)(subscriptionData);
        if (result.affectedRows > 0) {
            res.status(201).json((0, responseHandler_1.createResponse)(201, "Subscription added successfully."));
        }
        else {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Failed to add subscription."));
        }
    }
    catch (error) {
        console.error("Error adding subscription:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to add subscription."));
    }
};
exports.addNewSubscription = addNewSubscription;
// Update a subscription
const updateExistingSubscription = async (req, res) => {
    const { id } = req.params;
    const subscriptionData = req.body;
    try {
        const result = await (0, subscriptionsModels_1.updateSubscription)(Number(id), subscriptionData);
        res.json((0, responseHandler_1.createResponse)(200, "Subscription updated successfully."));
    }
    catch (error) {
        console.error("Error updating subscription:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update subscription."));
    }
};
exports.updateExistingSubscription = updateExistingSubscription;
// Delete a subscription by ID
const removeSubscription = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, subscriptionsModels_1.deleteSubscriptionById)(Number(id));
        res.json((0, responseHandler_1.createResponse)(200, "Subscription deleted successfully."));
    }
    catch (error) {
        console.error("Error deleting subscription:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to delete subscription."));
    }
};
exports.removeSubscription = removeSubscription;
// Get a subscription by ID
const fetchSubscriptionById = async (req, res) => {
    const { id } = req.params;
    try {
        const subscription = await (0, subscriptionsModels_1.getSubscriptionById)(Number(id));
        if (subscription) {
            res.json((0, responseHandler_1.createResponse)(200, "Subscription fetched successfully.", subscription));
        }
        else {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Subscription not found."));
        }
    }
    catch (error) {
        console.error("Error fetching subscription:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch subscription."));
    }
};
exports.fetchSubscriptionById = fetchSubscriptionById;
