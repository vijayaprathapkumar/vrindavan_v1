import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

export const orderTypes = {
  all: "All",
  1: "One Time Order",
  2: "Subscription",
  // 3: "One Day Order",
  // 5: "App Order",
};


export const getCartItemsByUserId = async (
  userId: number
): Promise<RowDataPacket[]> => {
  const sql = `
    SELECT 
      c.*, 
      f.* 
    FROM 
      carts c 
    JOIN 
      foods f ON c.food_id = f.id 
    WHERE 
      c.user_id = ? 
    ORDER BY 
      c.created_at DESC;
  `;

  const [rows] = await db.promise().query<RowDataPacket[]>(sql, [userId]);
  return rows;
};

export const addOrdersEntry = async (userId, orderDate) => {
  const addressSql = `
      SELECT da.id AS delivery_address_id, da.*, l.route_id, l.hub_id
      FROM delivery_addresses da
      LEFT JOIN localities l ON da.locality_id = l.id
      WHERE da.user_id = ?;
    `;

  try {
    const [addressRows] = await db.promise().query(addressSql, [userId]);
    const addressData = addressRows[0];

    if (!addressData || !addressData.locality_id || !addressData.hub_id) {
      console.warn(
        `Skipping order creation for user ${userId} due to missing hub or locality.`
      );
      return null;
    }

    const { route_id, hub_id, locality_id, delivery_address_id } = addressData;

    const orderSql = `
        INSERT INTO orders (
          user_id, order_type, order_date, route_id, hub_id, locality_id, 
          order_status_id, tax, delivery_fee, delivery_address_id, is_wallet_deduct, 
          created_at, updated_at
        ) 
        VALUES (?, 1, ?, ?, ?, ?, 1, 0.0, 0.0, ?, 1, NOW(), NOW());
      `;

    const [orderResult]: any = await db
      .promise()
      .query(orderSql, [
        userId,
        orderDate,
        route_id,
        hub_id,
        locality_id,
        delivery_address_id,
      ]);

    if (!orderResult?.insertId) {
      console.error(`Order creation failed for user ${userId}.`);
      return null; // Return null to indicate a failed order creation
    }

    return {
      status: true,
      orderId: orderResult.insertId,
      message: "Order created successfully",
    };
  } catch (error) {
    console.error(`Error creating order for user ${userId}:`, error);
    throw new Error("Error creating order.");
  }
};

export const addFoodOrderEntry = async (
  productAmount,
  quantity,
  productId,
  orderId
) => {
  const foodOrderSql = `
      INSERT INTO food_orders (
        price, quantity, food_id, order_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW());
    `;

  try {
    await db
      .promise()
      .query(foodOrderSql, [productAmount, quantity, productId, orderId]);
  } catch (error) {
    console.error(`Error creating food order for order ${orderId}:`, error);
    throw new Error("Error creating food order.");
  }
};

export const deleteAllCartItemsByUserId = async (userId: number) => {
  const sql = `
    DELETE FROM carts 
    WHERE user_id = ?;
  `;
  try {
    await db.promise().query(sql, [userId]);
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw new Error("Failed to clear cart items.");
  }
};