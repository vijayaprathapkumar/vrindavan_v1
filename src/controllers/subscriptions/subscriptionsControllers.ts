import { Request, Response } from "express";
import {
  getAllSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscriptionById,
  getSubscriptionById,
} from "../../models/subscriptions/subscriptionsModels";
import { createResponse } from "../../utils/responseHandler";

// Fetch all subscriptions for a user
export const fetchSubscriptions = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  try {
    const subscriptions = await getAllSubscriptions(userId);
    res.json(createResponse(200, "Subscriptions fetched successfully.", subscriptions));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json(createResponse(500, "Failed to fetch subscriptions."));
  }
};

// Add a new subscription
export const addNewSubscription = async (req: Request, res: Response) => {
  const subscriptionData = req.body;

  try {
    const result = await addSubscription(subscriptionData);
    if (result.affectedRows > 0) {
      res.status(201).json(createResponse(201, "Subscription added successfully."));
    } else {
      res.status(400).json(createResponse(400, "Failed to add subscription."));
    }
  } catch (error) {
    console.error("Error adding subscription:", error);
    res.status(500).json(createResponse(500, "Failed to add subscription."));
  }
};

// Update a subscription
export const updateExistingSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const subscriptionData = req.body;

  try {
    const result = await updateSubscription(Number(id), subscriptionData);
    res.json(createResponse(200, "Subscription updated successfully."));
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json(createResponse(500, "Failed to update subscription."));
  }
};

// Delete a subscription by ID
export const removeSubscription = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteSubscriptionById(Number(id));
    res.json(createResponse(200, "Subscription deleted successfully."));
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json(createResponse(500, "Failed to delete subscription."));
  }
};

// Get a subscription by ID
export const fetchSubscriptionById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const subscription = await getSubscriptionById(Number(id));
    if (subscription) {
      res.json(createResponse(200, "Subscription fetched successfully.", subscription));
    } else {
      res.status(404).json(createResponse(404, "Subscription not found."));
    }
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json(createResponse(500, "Failed to fetch subscription."));
  }
};
