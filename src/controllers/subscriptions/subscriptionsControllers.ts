// src/controllers/subscriptions/subscriptionsControllers.ts

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
} from "../../models/subscriptions/subscriptionsModels";
import { createResponse } from "../../utils/responseHandler";

export const addSubscription = async (req: Request, res: Response) => {
  const subscription: Subscription = req.body;

  try {
    const result = await addSubscriptionModel(subscription);
    res
      .status(201)
      .json(
        createResponse(201, "Subscription created successfully.", {
          id: result.insertId,
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

export const getSubscriptions = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const searchTerm = req.query.searchTerm as string || "";

  if (isNaN(userId)) {
    return res.status(400).json(createResponse(400, "Invalid user ID."));
  }

  try {
    const totalRecords = await getTotalSubscriptionsCountModel(userId);
    const totalPages = Math.ceil(totalRecords / limit);

    const subscriptions = await getAllSubscriptionsModel(
      userId,
      page,
      limit,
      searchTerm
    );

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
      .json(createResponse(200, "Subscriptions fetched successfully.", response));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res
      .status(500)
      .json(createResponse(500, "Failed to fetch subscriptions.", error.message));
  }
};



export const updateSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  const subscription: Subscription = req.body;

  try {
    const result = await updateSubscriptionModel(id, subscription);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found."));
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

export const deleteSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const result = await deleteSubscriptionModel(id);

    if (result.affectedRows === 0) {
      return res.status(404).json(createResponse(404, "Subscription not found."));
    }

    res.status(200).json(createResponse(200, "Subscription deleted successfully."));
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json(createResponse(500, "Failed to delete subscription.", error.message));
  }
};


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

export const cancelSubscription = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    const cancel_subscription = 1; // Automatically set to cancel (1)

    const result = await updateCancelSubscriptionModel(id, cancel_subscription);

    if (result.affectedRows === 0) {
      return res.status(404).json(createResponse(404, "Subscription not found."));
    }

    res.status(200).json(
      createResponse(200, "Subscription canceled successfully.", { id })
    );
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json(
      createResponse(500, "Failed to cancel subscription.", error.message)
    );
  }
};


export const getSubscriptionById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
console.log('id',id);

  // Validate that the id is a number
  if (isNaN(id)) {
    return res
      .status(400)
      .json(createResponse(400, "Invalid subscription ID."));
  }

  try {
    // Call the model to fetch the subscription by id
    const subscription = await getSubscriptionGetByIdModel(id);

    // If no subscription found, return 404
    if (!subscription) {
      return res
        .status(404)
        .json(createResponse(404, "Subscription not found."));
    }

    // Return the subscription details in the response
    res.status(200).json(
      createResponse(200, "Subscription fetched successfully.", subscription)
    );
  } catch (error) {
    console.error("Error fetching subscription by ID:", error);
    res
      .status(500)
      .json(
        createResponse(500, "Failed to fetch subscription.", error.message)
      );
  }
};