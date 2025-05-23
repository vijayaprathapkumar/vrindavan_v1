import { Request, Response } from "express";
import {
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
} from "../../models/subscriptions/subscriptionsModels";
import { createResponse } from "../../utils/responseHandler";

const validSubscriptionTypes = [
  "everyday",
  "alternative_day",
  "every_3_day",
  "every_7_day",
  "customize",
];

// Add Subscription
export const addSubscription = async (req: Request, res: Response) => {
  const subscription: Subscription = req.body;

  if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription type."));
  }

  try {
    const result = await addSubscriptionModel(subscription);
    const user_subscription_id = result.insertId;
  
    res.status(201).json(
      createResponse(201, "Subscription created successfully.", {
        id: user_subscription_id,
      })
    );
  } catch (error) {
    console.error("Error adding subscription:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to create subscription.", error.message)
      );
  }
};

// Fetch Subscriptions
export const getSubscriptions = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const limit = parseInt(req.query.limit as string) || 10;
  const page = parseInt(req.query.page as string) || 1;
  const searchTerm = (req.query.searchTerm as string) || "";

  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : undefined;
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : undefined;

  if (isNaN(userId)) {
    return res.status(400).json(createResponse(400, "Invalid user ID."));
  }

  try {
    const totalCount = await getTotalSubscriptionsCountModel(userId);
    const totalPages = Math.ceil(totalCount / limit);

    const subscriptions = await getAllSubscriptionsModel(
      userId,
      page,
      limit,
      searchTerm,
      startDate,
      endDate
    );

    res.status(200).json(
      createResponse(200, "Subscriptions fetched successfully.", {
        subscriptions,
        totalCount,
        currentPage: page,
        limit,
        totalPages,
      })
    );
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to fetch subscriptions.", error.message)
      );
  }
};

// Update Subscription
export const updateSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }
  const subscription: Subscription = req.body;

  if (!validSubscriptionTypes.includes(subscription.subscription_type)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription type."));
  }

  try {
    const result = await updateSubscriptionModel(id, subscription);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found."));
    }

    if (
      subscription.cancel_subscription === 1 ||
      subscription.is_pause_subscription
    ) {
      const cancel_subscription_date =
        subscription.cancel_subscription === 1 ? new Date() : null;
      const pause_date = subscription.is_pause_subscription ? new Date() : null;

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

    res
      .status(200)
      .json(createResponse(200, "Subscription updated successfully.", { id }));
  } catch (error) {
    console.error("Error updating subscription:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to update subscription.", error.message)
      );
  }
};

// Delete Subscription
export const deleteSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const result = await deleteSubscriptionModel(id);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found."));
    }

    res
      .status(200)
      .json(createResponse(200, "Subscription deleted successfully."));
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to delete subscription.", error.message)
      );
  }
};

// Pause Subscription
export const pauseSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    await pauseSubscriptionModel(id);
    res
      .status(200)
      .json(createResponse(200, "Subscription paused successfully.", { id }));
  } catch (error) {
    console.error("Error pausing subscription:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to pause subscription.", error.message)
      );
  }
};

// Resume Subscription
export const resumeSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    await resumeSubscriptionModel(id);
    res
      .status(200)
      .json(createResponse(200, "Subscription resumed successfully.", { id }));
  } catch (error) {
    console.error("Error resuming subscription:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to resume subscription.", error.message)
      );
  }
};

// Cancel Subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const cancel_subscription = 1;
    const cancel_subscription_date = new Date();

    const result = await updateCancelSubscriptionModel(
      id,
      cancel_subscription,
      cancel_subscription_date
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found."));
    }

    res
      .status(200)
      .json(createResponse(200, "Subscription canceled successfully.", { id }));
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to cancel subscription.", error.message)
      );
  }
};

// Get Subscription by ID
export const getSubscriptionById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const subscription = await getSubscriptionGetByIdModel(id);
    if (!subscription) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found."));
    }

    const response = { subscription: [subscription] };
    res
      .status(200)
      .json(
        createResponse(200, "Subscription fetched successfully.", response)
      );
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to fetch subscription.", error.message)
      );
  }
};

// Update Subscription Pause Info
export const updateSubscriptionPauseController = async (
  req: Request,
  res: Response
) => {
  const {
    user_id,
    is_pause_subscription,
    pause_start_time,
    pause_end_time,
    pause_until_come_back,
  } = req.body;
  const {
    id
  } = req.params;

  try {
    await updateSubscriptionPauseInfo(
      id,
      user_id,
      is_pause_subscription,
      pause_until_come_back,
      pause_start_time,
      pause_end_time
    );

    res
      .status(200)
      .json(createResponse(200, "Pause info updated successfully."));
  } catch (error) {
    console.error("Error updating subscription pause info:", error);
    res
      .status(500)
      .json(createResponse(500, "Failed to update pause info.", error.message));
  }
};
