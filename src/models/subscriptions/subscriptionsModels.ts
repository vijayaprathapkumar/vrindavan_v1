// src/models/subscriptions/subscriptionsModels.ts

import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";
import cron from 'node-cron';
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

export const addSubscriptionQuantityChangeModel = (
  user_subscription_id: number,
  user_id: number,
  quantity: string,
  product_id: number,
  start_date: string,
  end_date: string,
  cancel_subscription: number,
  pause_subscription: boolean,
  order_date: Date | null = null,
  pause_date: Date | null = null,
  cancel_order_date: Date | null = null,
  cancel_subscription_date: Date | null = null,
  cancel_order: string | null = null,
  today_order: string | null = null,
  previous_order: string | null = null
): Promise<OkPacket> => {
  return new Promise((resolve, reject) => {
    const changeData = {
      user_subscription_id,
      order_type: 2,
      user_id,
      product_id,
      quantity,
      order_date: order_date || null,
      start_date: start_date || null,
      end_date: end_date || null,
      cancel_subscription: cancel_subscription || null,
      pause_date: pause_subscription ? pause_date : null, 
      cancel_order_date: cancel_order_date || null,
      cancel_subscription_date: cancel_subscription_date || null,
      cancel_order: cancel_order || null,
      today_order: today_order || null,
      previous_order: previous_order || null,
      pause_subscription: pause_subscription ? "1" : "0",
      reason: null, 
      other_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    db.query<OkPacket>(
      "INSERT INTO subscription_quantity_changes SET ?",
      [changeData],
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
  limit: number,
  searchTerm?: string
): Promise<any[]> => {
  const offset = (page - 1) * limit;
  const searchQuery = searchTerm ? `%${searchTerm}%` : null;

  return new Promise((resolve, reject) => {
    let query = `
      SELECT user_subscriptions.*, 
              foods.id as food_id, 
              foods.name, 
              foods.price, 
              foods.discount_price, 
              foods.description, 
              foods.perma_link, 
              foods.ingredients, 
              foods.package_items_count, 
              foods.weight, 
              foods.unit, 
              foods.sku_code, 
              foods.barcode, 
              foods.cgst, 
              foods.sgst, 
              foods.subscription_type, 
              foods.track_inventory, 
              foods.featured, 
              foods.deliverable, 
              foods.restaurant_id, 
              foods.category_id, 
              foods.subcategory_id, 
              foods.product_type_id, 
              foods.hub_id, 
              foods.locality_id, 
              foods.product_brand_id, 
              foods.weightage, 
              foods.status, 
              foods.created_at, 
              foods.updated_at, 
              foods.food_locality, 
              foods.image
      FROM user_subscriptions 
      LEFT JOIN foods ON user_subscriptions.product_id = foods.id 
      WHERE user_subscriptions.user_id = ? 
    `;

    if (searchQuery) {
      query += ` AND foods.name LIKE ?`;
    }

    query += ` ORDER BY user_subscriptions.created_at DESC LIMIT ?, ?`;

    const params: any[] = searchQuery
      ? [userId, searchQuery, offset, limit]
      : [userId, offset, limit];

    db.query<RowDataPacket[]>(query, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

export const getTotalSubscriptionsCountModel = (
  userId: number
): Promise<number> => {
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
    updated_at: new Date(),
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

      
        const pauseDate = new Date();
        db.query<OkPacket>(
          "UPDATE subscription_quantity_changes SET pause_subscription=1, pause_date = ?, updated_at = NOW() WHERE user_subscription_id = ?",
          [pauseDate, id], 
          (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          }
        );
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
export const getSubscriptionByIdModel = (id: number): Promise<any | null> => {
  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      `SELECT user_subscriptions.*, 
              foods.id as food_id, foods.name, foods.price, foods.discount_price, 
              foods.description, foods.perma_link, foods.ingredients, 
              foods.package_items_count, foods.weight, foods.unit, foods.sku_code, 
              foods.barcode, foods.cgst, foods.sgst, foods.subscription_type, 
              foods.track_inventory, foods.featured, foods.deliverable, 
              foods.restaurant_id, foods.category_id, foods.subcategory_id, 
              foods.product_type_id, foods.hub_id, foods.locality_id, 
              foods.product_brand_id, foods.weightage, foods.status, 
              foods.created_at as food_created_at, foods.updated_at as food_updated_at, 
              foods.food_locality, foods.image
      FROM user_subscriptions
      JOIN foods ON user_subscriptions.product_id = foods.id
      WHERE user_subscriptions.id = ?`,
      [id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results.length > 0 ? results[0] : null);
      }
    );
  });
};

export const updateCancelSubscriptionModel = (
  id: number,
  cancel_subscription: number,
  cancel_subscription_date: Date 
): Promise<OkPacket> => {
  return new Promise((resolve, reject) => {
    db.query<OkPacket>(
      "UPDATE user_subscriptions SET cancel_subscription = ?, updated_at = NOW() WHERE id = ?",
      [cancel_subscription, id],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        db.query<OkPacket>(
          "UPDATE subscription_quantity_changes SET cancel_subscription = ?, cancel_subscription_date = ?, updated_at = NOW() WHERE user_subscription_id = ?",
          [cancel_subscription, cancel_subscription_date, id],
          (err, result) => {
            if (err) {
              return reject(err);
            }
            resolve(result);
          }
        );
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


export const updateSubscriptionPauseInfo = async (
  userId: number,
  isPauseSubscription: number,
  pauseUntilComeBack?: number,
  startDate?: string,
  endDate?: string
) => {

  const shouldPause = pauseUntilComeBack === 1 || startDate || endDate;
  isPauseSubscription = shouldPause ? 1 : 0;

  let sql = `
    UPDATE user_subscriptions 
    SET 
      is_pause_subscription = ?,
      pause_until_i_come_back = ?, 
      pause_specific_period_startDate = ?, 
      pause_specific_period_endDate = ? 
    WHERE user_id = ?;
  `;

  const values = [
    isPauseSubscription,
    pauseUntilComeBack || 0,  
    startDate || null,
    endDate || null,
    userId,
  ];

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, values);
    return result;
  } catch (error) {
    console.error("Error updating subscription pause info:", error);
    throw new Error("Failed to update subscription pause information.");
  }
};

cron.schedule('0 0 * * *', async () => {
  const currentDate = new Date().toISOString();
  console.log('currentDate', currentDate);

  const sql = `
    UPDATE user_subscriptions
    SET
      is_pause_subscription = 0,
      pause_until_i_come_back = 0,
      pause_specific_period_startDate = NULL,
      pause_specific_period_endDate = NULL
    WHERE
      (is_pause_subscription = 1 OR 
      pause_until_i_come_back = 1 OR 
      pause_specific_period_startDate IS NOT NULL OR 
      pause_specific_period_endDate IS NOT NULL) AND 
      (pause_specific_period_endDate <= ?);
  `;

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, [currentDate]);
    console.log(`Updated ${result.affectedRows} subscriptions that reached their end date`);
  } catch (error) {
    console.error("Error updating subscriptions:", error);
  }
});

