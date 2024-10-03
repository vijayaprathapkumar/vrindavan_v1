import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

interface Payment {
  id: number; 
  price: number; 
  description: string; 
  user_id: number; 
  status: string; 
  method: string; 
  createdAt: Date; 
  updatedAt: Date; 
}

// Fetch all payments for a user
export const getAllPayments = async (userId: number, page: number, limit: number): Promise<{ total: number; payments: Payment[] }> => {
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
      ORDER BY created_at DESC -- or ORDER BY updated_at DESC
      LIMIT ? OFFSET ?;
    `;
  
    const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [userId, limit, offset]);
  
    const payments = rows.map(row => ({
      id: row.id,
      price: row.price,
      description: row.description,
      user_id: row.user_id,
      status: row.status,
      method: row.method,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  
    return { total, payments };
  };
  
// Add a new payment
export const addPayment = async (paymentData: { price: number; description: string; userId: number; status: string; method: string }) => {
  const { price, description, userId, status, method } = paymentData;

  const sql = `
    INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;
  const values = [price, description, userId, status, method];

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, values);
    return result; // Return the result to check for affected rows
  } catch (error) {
    console.error("SQL Error:", error); // Log SQL error
    throw new Error("Failed to add payment.");
  }
};

// Update a payment
export const updatePayment = async (id: number, paymentData: { price: number; description: string; status: string; method: string }) => {
    const { price, description, status, method } = paymentData;
  
    const sql = `
      UPDATE payments 
      SET price = ?, description = ?, status = ?, method = ?, updated_at = NOW() 
      WHERE id = ?;
    `;
    
    const [result]: [OkPacket, any] = await db.promise().query(sql, [price, description, status, method, id]);
    if (result.affectedRows === 0) {
      throw new Error("Payment not found or no changes made.");
    }
  };
  
// Delete a payment by ID
export const deletePaymentById = async (id: number) => {
    const sql = `
      DELETE FROM payments 
      WHERE id = ?;
    `;
    
    const [result]: [OkPacket, any] = await db.promise().query(sql, [id]);
    if (result.affectedRows === 0) {
      throw new Error("Payment not found.");
    }
  };