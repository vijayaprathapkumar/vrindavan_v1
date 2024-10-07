// src/controllers/subscriptions/subscriptionsControllers.ts

import { Request, Response } from "express"; // Importing Request and Response types
import {
  // Importing necessary model functions
  addSubscriptionModel,
  deleteSubscriptionModel,
  getAllSubscriptionsModel,
  pauseSubscriptionModel,
  resumeSubscriptionModel,
  updateSubscriptionModel,
  Subscription,
  getTotalSubscriptionsCountModel,
  updateCancelSubscriptionModel,
  getSubscriptionGetByIdModel,
  addSubscriptionQuantityChangeModel,
  updateSubscriptionPauseInfo,
} from "../../models/subscriptions/subscriptionsModels"; // Importing the subscription models
import { createResponse } from "../../utils/responseHandler"; // Importing response handler utility

// Valid subscription types
const validSubscriptionTypes = [
  "everyday",
  "alternative Day",
  "every 3rd day",
  "weekends",
  "customize",
];

// Add Subscription
export const addSubscription = async (req: Request, res: Response) => {
  const subscription: Subscription = req.body; // Extracting subscription data from request body

  // Validate subscription type
  if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription type provided."));
  }

  try {
    const result = await addSubscriptionModel(subscription); // Add subscription to the database
    const user_subscription_id = result.insertId; // Get the new subscription ID

    // Additional fields
    const cancel_subscription = subscription.cancel_subscription || 0;
    const pause_subscription = subscription.is_pause_subscription || false;
    let cancel_subscription_date =
      cancel_subscription === 1 ? new Date() : null;
    let pause_date = pause_subscription ? new Date() : null;

    // Add quantity change model
    await addSubscriptionQuantityChangeModel(
      user_subscription_id,
      subscription.user_id,
      subscription.quantity,
      subscription.product_id,
      subscription.start_date,
      subscription.end_date,
      cancel_subscription,
      pause_subscription,
      null,
      pause_date,
      null,
      cancel_subscription_date
    );

    // Respond with success
    res
      .status(201)
      .json(
        createResponse(201, "Subscription created successfully.", {
          id: user_subscription_id,
        })
      );
  } catch (error) {
    console.error("Error adding subscription:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to create subscription.", error.message)
      ); // Respond with error
  }
};

// Fetch Subscriptions
export const getSubscriptions = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId); // Get user ID from request parameters
  const page = parseInt(req.query.page as string) || 1; // Get page number from query parameters
  const limit = parseInt(req.query.limit as string) || 10; // Get limit from query parameters
  const searchTerm = (req.query.searchTerm as string) || ""; // Get search term from query parameters

  // Validate user ID
  if (isNaN(userId)) {
    return res.status(400).json(createResponse(400, "Invalid user ID."));
  }

  try {
    const totalRecords = await getTotalSubscriptionsCountModel(userId); // Get total subscriptions
    const totalPages = Math.ceil(totalRecords / limit); // Calculate total pages

    const subscriptions = await getAllSubscriptionsModel(
      userId,
      page,
      limit,
      searchTerm
    ); // Get subscriptions
    res.status(200).json(
      createResponse(200, "Subscriptions fetched successfully.", {
        // Respond with subscriptions
        subscriptions,
        pagination: {
          totalRecords,
          currentPage: page,
          limit,
          totalPages,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to fetch subscriptions.", error.message)
      ); // Respond with error
  }
};

// Update Subscription
export const updateSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id); // Get subscription ID from request parameters

  // Validate subscription ID
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  const subscription: Subscription = req.body; // Extract subscription data from request body

  // Validate subscription type
  if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription type provided."));
  }

  try {
    const result = await updateSubscriptionModel(id, subscription); // Update subscription in the database
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found.")); // Respond if not found
    }

    // Check for cancellation or pause
    if (
      subscription.cancel_subscription === 1 ||
      subscription.is_pause_subscription
    ) {
      const cancel_subscription_date =
        subscription.cancel_subscription === 1 ? new Date() : null;
      const pause_date = subscription.is_pause_subscription ? new Date() : null;

      // Add quantity change model
      await addSubscriptionQuantityChangeModel(
        id,
        subscription.user_id,
        subscription.quantity,
        subscription.product_id,
        subscription.start_date,
        subscription.end_date,
        subscription.cancel_subscription,
        subscription.is_pause_subscription,
        null,
        pause_date,
        null,
        cancel_subscription_date
      );
    }

    // Respond with success
    res
      .status(200)
      .json(createResponse(200, "Subscription updated successfully.", { id }));
  } catch (error) {
    console.error("Error updating subscription:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to update subscription.", error.message)
      ); // Respond with error
  }
};

// Delete Subscription
export const deleteSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id); // Get subscription ID from request parameters

  // Validate subscription ID
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const result = await deleteSubscriptionModel(id); // Delete subscription from the database

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found.")); // Respond if not found
    }

    // Respond with success
    res
      .status(200)
      .json(createResponse(200, "Subscription deleted successfully."));
  } catch (error) {
    console.error("Error deleting subscription:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to delete subscription.", error.message)
      ); // Respond with error
  }
};

// Pause Subscription
export const pauseSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id); // Get subscription ID from request parameters

  // Validate subscription ID
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    await pauseSubscriptionModel(id); // Pause subscription in the database
    res
      .status(200)
      .json(createResponse(200, "Subscription paused successfully.", { id })); // Respond with success
  } catch (error) {
    console.error("Error pausing subscription:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to pause subscription.", error.message)
      ); // Respond with error
  }
};

// Resume Subscription
export const resumeSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id); // Get subscription ID from request parameters

  // Validate subscription ID
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    await resumeSubscriptionModel(id); // Resume subscription in the database
    res
      .status(200)
      .json(createResponse(200, "Subscription resumed successfully.", { id })); // Respond with success
  } catch (error) {
    console.error("Error resuming subscription:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to resume subscription.", error.message)
      ); // Respond with error
  }
};

// Cancel Subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id); // Get subscription ID from request parameters

  // Validate subscription ID
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const cancel_subscription = 1; // Mark as canceled
    const cancel_subscription_date = new Date(); // Set cancel date

    const result = await updateCancelSubscriptionModel(
      id,
      cancel_subscription,
      cancel_subscription_date
    ); // Update subscription to canceled
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found.")); // Respond if not found
    }

    // Respond with success
    res
      .status(200)
      .json(createResponse(200, "Subscription canceled successfully.", { id }));
  } catch (error) {
    console.error("Error canceling subscription:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to cancel subscription.", error.message)
      ); // Respond with error
  }
};

// Get Subscription by ID
export const getSubscriptionById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id); // Get subscription ID from request parameters

  // Validate subscription ID
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const subscription = await getSubscriptionGetByIdModel(id); // Fetch subscription by ID
    if (!subscription) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found.")); // Respond if not found
    }

    // Respond with subscription data
    res
      .status(200)
      .json(
        createResponse(200, "Subscription fetched successfully.", subscription)
      );
  } catch (error) {
    console.error("Error fetching subscription:", error); // Log error
    res
      .status(500)
      .json(
        createResponse(500, "Failed to fetch subscription.", error.message)
      ); // Respond with error
  }
};

// Update Subscription Pause Info
export const updateSubscriptionPauseController = async (
  req: Request,
  res: Response
) => {
  const {
    user_id,
    pause_until_i_come_back,
    pause_specific_period_startDate,
    pause_specific_period_endDate,
  } = req.body;

  // Validate required fields
  if (
    !user_id ||
    !pause_specific_period_startDate ||
    !pause_specific_period_endDate
  ) {
    return res
      .status(400)
      .json(createResponse(400, "Missing required fields."));
  }

  try {
    await updateSubscriptionPauseInfo(
      user_id,
      pause_until_i_come_back,
      pause_specific_period_startDate,
      pause_specific_period_endDate
    );
    res
      .status(200)
      .json(
        createResponse(200, "Subscription pause info updated successfully.")
      );
  } catch (error) {
    console.error("Error updating subscription pause info:", error);
    res
      .status(500)
      .json(
        createResponse(
          500,
          "Failed to update subscription pause info.",
          error.message
        )
      );
  }
};
