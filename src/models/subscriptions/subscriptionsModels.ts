import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

interface Subscription {
  id: number;
  userId: number;
  name: string;
  stripeId: string;
  stripeStatus: string;
  stripePrice?: string;
  quantity?: number;
  trialEndsAt?: Date;
  endsAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Fetch all subscriptions for a user
export const getAllSubscriptions = async (
  userId: number
): Promise<Subscription[]> => {
  const query = `SELECT * FROM subscriptions WHERE user_id = ?;`;
  const [rows]: [RowDataPacket[], any] = await db
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

// Add a new subscription
export const addSubscription = async (subscriptionData: Subscription) => {
  const { userId, name, stripeId, stripeStatus, stripePrice, quantity } =
    subscriptionData;
  const sql = `
    INSERT INTO subscriptions (user_id, name, stripe_id, stripe_status, stripe_price, quantity, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;
  const values = [userId, name, stripeId, stripeStatus, stripePrice, quantity];

  const [result]: [OkPacket, any] = await db.promise().query(sql, values);
  return result; // Return the result to check for affected rows
};

// Update a subscription
export const updateSubscription = async (
    id: number,
    subscriptionData: Partial<Subscription>
  ) => {
   
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
      const [result] = await db.promise().query(sql, values);
      return result; 
    } catch (error) {
      throw new Error(`Error updating subscription: ${error.message}`);
    }
  };
  
  

// Delete a subscription by ID
export const deleteSubscriptionById = async (id: number) => {
  const sql = `
    DELETE FROM subscriptions 
    WHERE id = ?;
  `;
  await db.promise().query(sql, [id]);
};

// Get subscription by ID
export const getSubscriptionById = async (
  id: number
): Promise<Subscription | null> => {
  const query = `SELECT * FROM subscriptions WHERE id = ?;`;
  const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [id]);

  // Map the row to the Subscription type if it exists
  return rows.length
    ? ({
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
      } as Subscription)
    : null;
};
