import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

interface Order {
  id: number;
  user_id: number;
  order_type: string;
  order_date: Date;
  route_id: number;
  hub_id: number;
  locality_id: number;
  delivery_boy_id: number;
  order_status_id: number;
  tax: number;
  delivery_fee: number;
  hint?: string;
  active: boolean;
  driver_id?: number;
  delivery_address_id: number;
  payment_id: number;
  is_wallet_deduct: boolean;
  delivery_status: boolean;
  created_at: Date;
  updated_at: Date;
}

// Fetch all orders for a user
export const getAllOrders = async (userId: number, page: number, limit: number): Promise<{ total: number; orders: Order[] }> => {
    const offset = (page - 1) * limit;
  
    const countQuery = `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`;
    const [countRows]: [RowDataPacket[], any] = await db.promise().query(countQuery, [userId]);
    const total = countRows[0].total;
  
    const query = `
      SELECT 
        id, 
        user_id, 
        order_type, 
        order_date, 
        route_id, 
        hub_id, 
        locality_id, 
        delivery_boy_id, 
        order_status_id, 
        tax, 
        delivery_fee, 
        hint, 
        active, 
        driver_id, 
        delivery_address_id, 
        payment_id, 
        is_wallet_deduct, 
        delivery_status, 
        created_at, 
        updated_at 
      FROM 
        orders 
      WHERE 
        user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?;
    `;
  
    const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [userId, limit, offset]);
  
    const orders = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      order_type: row.order_type,
      order_date: row.order_date,
      route_id: row.route_id,
      hub_id: row.hub_id,
      locality_id: row.locality_id,
      delivery_boy_id: row.delivery_boy_id,
      order_status_id: row.order_status_id,
      tax: row.tax,
      delivery_fee: row.delivery_fee,
      hint: row.hint,
      active: row.active,
      driver_id: row.driver_id,
      delivery_address_id: row.delivery_address_id,
      payment_id: row.payment_id,
      is_wallet_deduct: row.is_wallet_deduct,
      delivery_status: row.delivery_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  
    return { total, orders };
  };

 // Fetch an order by ID
 export const getOrderById = async (id: number): Promise<Order | null> => {
    const query = `
      SELECT 
        id, 
        user_id, 
        order_type, 
        order_date, 
        route_id, 
        hub_id, 
        locality_id, 
        delivery_boy_id, 
        order_status_id, 
        tax, 
        delivery_fee, 
        hint, 
        active, 
        driver_id, 
        delivery_address_id, 
        payment_id, 
        is_wallet_deduct, 
        delivery_status, 
        created_at, 
        updated_at 
      FROM 
        orders 
      WHERE id = ?;
    `;
  
    const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [id]);
  
    // Cast the first row to Order type
    const order = rows.length > 0 ? (rows[0] as Order) : null; // Ensure correct casting here
    return order;
};
  

// Update an order
export const updateOrder = async (id: number, orderData: Order) => {
  const sql = `
    UPDATE orders 
    SET 
      user_id = ?, 
      order_type = ?, 
      order_date = ?, 
      route_id = ?, 
      hub_id = ?, 
      locality_id = ?, 
      delivery_boy_id = ?, 
      order_status_id = ?, 
      tax = ?, 
      delivery_fee = ?, 
      hint = ?, 
      active = ?, 
      driver_id = ?, 
      delivery_address_id = ?, 
      payment_id = ?, 
      is_wallet_deduct = ?, 
      delivery_status = ?, 
      updated_at = NOW() 
    WHERE id = ?;
  `;
  
  const values = [
    orderData.user_id,
    orderData.order_type,
    orderData.order_date,
    orderData.route_id,
    orderData.hub_id,
    orderData.locality_id,
    orderData.delivery_boy_id,
    orderData.order_status_id,
    orderData.tax,
    orderData.delivery_fee,
    orderData.hint,
    orderData.active,
    orderData.driver_id,
    orderData.delivery_address_id,
    orderData.payment_id,
    orderData.is_wallet_deduct,
    orderData.delivery_status,
    id,
  ];

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, values);
    if (result.affectedRows === 0) {
      throw new Error("Order not found or no changes made.");
    }
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error("Failed to update order.");
  }
};

// Delete an order by ID
export const deleteOrderById = async (id: number) => {
  const sql = `DELETE FROM orders WHERE id = ?;`;
  
  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, [id]);
    if (result.affectedRows === 0) {
      throw new Error("Order not found.");
    }
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error("Failed to delete order.");
  }
};
