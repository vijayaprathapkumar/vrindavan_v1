// src/models/subscriptions/subscriptionsModels.ts

import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Define the Subscription interface
export interface Subscription {
  id?: number;
  user_id: number;
  product_id: number;
  subscription_type: string;
  start_date: string;
  end_date: string;
  quantity: string;
  monday_qty: string;
  tuesday_qty: string;
  wednesday_qty: string;
  thursday_qty: string;
  friday_qty: string;
  saturday_qty: string;
  sunday_qty: string;
  active: boolean;
  cancel_subscription: number;
  created_at?: Date;
  updated_at?: Date;
  is_pause_subscription: boolean;
}

export const addSubscriptionModel = (
  subscription: Subscription
): Promise<OkPacket> => {
  const newSubscription = {
    ...subscription,
    created_at: new Date(),
    updated_at: new Date(),
  };

  return new Promise((resolve, reject) => {
    db.query<OkPacket>(
      "INSERT INTO user_subscriptions SET ?",
      [newSubscription],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

export const getAllSubscriptionsModel = (
  userId: number,
  page: number,
  limit: number
): Promise<Subscription[]> => {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      "SELECT * FROM user_subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?",
      [userId, limit, offset],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results as Subscription[]);
      }
    );
  });
};

export const getTotalSubscriptionsCountModel = (userId: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM user_subscriptions WHERE user_id = ?",
      [userId],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results[0].count);
      }
    );
  });
};


export const updateSubscriptionModel = (
  id: number,
  subscription: Subscription
): Promise<OkPacket> => {
  const updatedSubscription = {
    ...subscription,
    updated_at: new Date(), // Update timestamp
  };

  return new Promise((resolve, reject) => {
    db.query<OkPacket>(
      "UPDATE user_subscriptions SET ? WHERE id = ?",
      [updatedSubscription, id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

// Model to delete a subscription by ID
export const deleteSubscriptionModel = (id: number): Promise<OkPacket> => {
  return new Promise((resolve, reject) => {
    db.query<OkPacket>(
      "DELETE FROM user_subscriptions WHERE id = ?",
      [id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};


// Model to pause a subscription by ID
export const pauseSubscriptionModel = (id: number): Promise<OkPacket> => {
  return new Promise((resolve, reject) => {
    db.query<OkPacket>(
      "UPDATE user_subscriptions SET is_pause_subscription = 1 WHERE id = ?",
      [id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

// Model to resume a subscription by ID
export const resumeSubscriptionModel = (id: number): Promise<OkPacket> => {
  return new Promise((resolve, reject) => {
    db.query<OkPacket>(
      "UPDATE user_subscriptions SET is_pause_subscription = 0 WHERE id = ?",
      [id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

// Model to get a subscription by ID
export const getSubscriptionByIdModel = (
  id: number
): Promise<Subscription | null> => {
  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      "SELECT * FROM user_subscriptions WHERE id = ?",
      [id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results.length > 0 ? (results[0] as Subscription) : null);
      }
    );
  });
};

export const updateCancelSubscriptionModel = (
  id: number,
  cancel_subscription: number
): Promise<OkPacket> => {
  return new Promise((resolve, reject) => {
    db.query<OkPacket>(
      "UPDATE user_subscriptions SET cancel_subscription = ?, updated_at = NOW() WHERE id = ?",
      [cancel_subscription, id],  
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};


export const getSubscriptionGetByIdModel = (
  id: number
): Promise<Subscription | null> => {
  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      "SELECT * FROM user_subscriptions WHERE id = ?",
      [id],
      (error, results) => {
        if (error) {
          console.log("Query Results:", error); 
          return reject(error);
        }
        console.log("Query Results:", results); 
        resolve(results.length > 0 ? (results[0] as Subscription) : null);
      }
    );
  });
};
