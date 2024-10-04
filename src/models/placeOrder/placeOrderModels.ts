import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

interface PlaceOrder {
  id: number; 
  price: number; 
  description: string; 
  user_id: number; 
  status: string; 
  method: string; 
  createdAt: Date; 
  updatedAt: Date; 
}

// Fetch all place orders for a user
export const getAllPlaceOrders = async (userId: number, page: number, limit: number): Promise<{ total: number; placeOrders: PlaceOrder[] }> => {
    const offset = (page - 1) * limit;
  
    const countQuery = `SELECT COUNT(*) as total FROM payments WHERE user_id = ?`;
    const [countRows]: [RowDataPacket[], any] = await db.promise().query(countQuery, [userId]);
    const total = countRows[0].total;
  
    const query = `
      SELECT 
        id, 
        price, 
        description, 
        user_id, 
        status, 
        method, 
        created_at, 
        updated_at 
      FROM 
        payments 
      WHERE 
        user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?;
    `;
  
    const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [userId, limit, offset]);
  
    const placeOrders = rows.map(row => ({
      id: row.id,
      price: row.price,
      description: row.description,
      user_id: row.user_id,
      status: row.status,
      method: row.method,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  
    return { total, placeOrders };
};

// Add a new place order and update wallet balance
export const addPlaceOrder = async (placeOrderData: { price: number; description?: string; userId: number; status: string; method: string }) => {
  const { price, description, userId, status, method } = placeOrderData;

  // Set a default description if none is provided
  const defaultDescription = description || `Default place order for user ${userId}`;

  const sql = `
    INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;
  
  const values = [price, defaultDescription, userId, status, method];

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, values);

    await deductFromWalletBalance(userId, price);

    return result;
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error("Failed to add place order.");
  }
};

export const getPriceForNextOrder = async (userId: number): Promise<number | null> => {
  const sql = `SELECT price FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;`;

  try {
    const [rows]: [RowDataPacket[], any] = await db.promise().query(sql, [userId]);
    return rows.length > 0 ? rows[0].price : null; 
  } catch (error) {
    console.error("Error fetching price:", error);
    throw new Error("Failed to fetch price for the user.");
  }
};


// Update a place order and wallet balance
export const updatePlaceOrder = async (id: number, placeOrderData: { price: number; description: string; status: string; method: string }) => {
  const { price, description, status, method } = placeOrderData;

  const currentOrderSql = `SELECT price, user_id FROM payments WHERE id = ?`;
  
  try {
    const [currentOrderRows]: [RowDataPacket[], any] = await db.promise().query(currentOrderSql, [id]);

    if (currentOrderRows.length === 0) {
      throw new Error("Place order not found.");
    }

    const currentOrder = currentOrderRows[0];
    const userId = currentOrder.user_id;

    await deductFromWalletBalance(userId, currentOrder.price);

    const sql = `
      UPDATE payments 
      SET price = ?, description = ?, status = ?, method = ?, updated_at = NOW() 
      WHERE id = ?;
    `;

    const [result]: [OkPacket, any] = await db.promise().query(sql, [price, description, status, method, id]);
    
    if (result.affectedRows === 0) {
      throw new Error("No changes made to the place order.");
    }

    await deductFromWalletBalance(userId, price);
    
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error("Failed to update place order.");
  }
};


// Delete a place order by ID
export const deletePlaceOrderById = async (id: number) => {
  const sql = `
    DELETE FROM payments 
    WHERE id = ?;
  `;

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, [id]);

    if (result.affectedRows === 0) {
      throw new Error("Place order not found.");
    }
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error("Failed to delete place order.");
  }
};

// Function to deduct the payment amount from the wallet balance
export const deductFromWalletBalance = async (userId: number, amount: number) => {
  const sql = `
    UPDATE wallet_balances 
    SET balance = balance - ? 
    WHERE user_id = ?;
  `;

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, [amount, userId]);
    
    if (result.affectedRows === 0) {
      throw new Error("Wallet balance not found for the user.");
    }
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    throw new Error("Failed to update wallet balance.");
  }
};
