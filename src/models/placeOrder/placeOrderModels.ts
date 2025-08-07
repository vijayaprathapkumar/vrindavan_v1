import { db } from "../../config/databaseConnection";
import { FieldPacket, RowDataPacket } from "mysql2";

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

    let deliveryBoyId = null;
    const localityDeliveryBoyQuery = `
      SELECT delivery_boy_id 
      FROM locality_delivery_boys 
      WHERE locality_id = ?
      LIMIT 1
    `;

    const [localityDeliveryBoys]: [RowDataPacket[], FieldPacket[]] = await db
      .promise()
      .query(localityDeliveryBoyQuery, [addressData.locality_id]);

    if (localityDeliveryBoys.length > 0) {
      deliveryBoyId = localityDeliveryBoys[0].delivery_boy_id;
    }

    const orderSql = `
        INSERT INTO orders (
          user_id, order_type, order_date, route_id, hub_id, locality_id, delivery_boy_id,
          order_status_id, tax, delivery_fee, delivery_address_id, is_wallet_deduct, 
          created_at, updated_at
        ) 
        VALUES (?, 1, ?, ?, ?, ?, ?, 1, 0.0, 0.0, ?, 0, NOW(), NOW());
      `;

    const [orderResult]: any = await db
      .promise()
      .query(orderSql, [
        userId,
        orderDate,
        route_id,
        hub_id,
        locality_id,
        deliveryBoyId,
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
  productAmount: number,
  quantity: number,
  productId: number,
  orderId: number
) => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Insert food order
    const foodOrderSql = `
      INSERT INTO food_orders (
        price, quantity, food_id, order_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
    await connection.query(foodOrderSql, [
      productAmount,
      quantity,
      productId,
      orderId,
    ]);

    // Create stock mutation (negative amount to reduce inventory)
    const stockMutationSql = `
      INSERT INTO stock_mutations (
        stockable_type, 
        stockable_id, 
        amount, 
        description, 
        created_at, 
        updated_at
      ) VALUES (
        'App\\\\Models\\\\Food', 
        ?, 
        ?, 
        'Stock reduced due to food order', 
        NOW(), 
        NOW()
      );
    `;
    await connection.query(stockMutationSql, [productId, -quantity]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error(`Error processing food order for order ${orderId}:`, error);
    throw new Error("Error processing food order.");
  } finally {
    connection.release();
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

export const deductFromWalletOneTimeOrder = async (
  userId: number,
  amount: number
): Promise<{ success: boolean; paymentId?: number }> => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // Check current balance
    const [walletRows]: any = await connection.query(
      "SELECT balance FROM wallet_balances WHERE user_id = ? FOR UPDATE",
      [userId]
    );

    if (walletRows.length === 0) {
      console.log(`No wallet found for user ${userId}`);
      await connection.rollback();
      return { success: false };
    }

    const currentBalance = parseFloat(walletRows[0].balance);
    if (currentBalance < amount) {
      console.log(`Insufficient balance for user ${userId}`);
      await connection.rollback();
      return { success: false };
    }

    // Create payment entry first
    const [paymentResult]: any = await connection.query(
      `INSERT INTO payments 
       (price, description, user_id, status, method, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [amount, "", userId, "completed", "wallet"]
    );

    const paymentId = paymentResult.insertId;

    // Deduct the amount from wallet
    await connection.query(
      "UPDATE wallet_balances SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?",
      [amount, userId]
    );

    await connection.commit();

    return {
      success: true,
      paymentId: paymentId,
    };
  } catch (error) {
    await connection.rollback();
    console.error(`Error deducting from wallet for user ${userId}:`, error);
    return { success: false };
  } finally {
    connection.release();
  }
};

export const logWalletOneTimeOrder = async (data: {
  userId: number;
  orderId: number;
  beforeBalance: number;
  amount: number;
  orderDate: string;
  afterBalance: number;
  description?: string;
  foodName?: string;
  quantity?: number;
  unit?: string;
}): Promise<void> => {
  const todayDate = new Date();
  const formattedTodayDate = `${todayDate
    .getDate()
    .toString()
    .padStart(2, "0")}-${(todayDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${todayDate.getFullYear()}`;

  // Format the description if foodName and quantity are provided
  const formattedDescription =
    data.foodName && data.quantity
      ? `₹${data.amount} deducted - ${data.foodName} ${data.unit} x ${data.quantity} (One Time Order | Order Id: ${data.orderId}). Balance ₹${data.beforeBalance} → ₹${data.afterBalance}`
      : data.description || `Deduction for order ${data.orderId}`;

  const walletLogSql = `
    INSERT INTO wallet_logs (
      user_id, 
      order_id, 
      order_date, 
      before_balance, 
      amount, 
      after_balance, 
      wallet_type, 
      description, 
      created_at, 
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;

  try {
    await db
      .promise()
      .query(walletLogSql, [
        data.userId,
        data.orderId,
        data.orderDate,
        data.beforeBalance,
        data.amount,
        data.afterBalance,
        "deduction",
        formattedDescription,
      ]);
  } catch (error) {
    console.error("Error logging wallet transaction:", error);
    throw error;
  }
};

export const updateOrderWalletInfo = async (
  orderId: number,
  paymentId: number
): Promise<void> => {
  const sql = `
    UPDATE orders 
    SET is_wallet_deduct = 1, 
        payment_id = ?,
        updated_at = NOW()
    WHERE id = ?;
  `;

  try {
    await db.promise().query(sql, [paymentId, orderId]);
  } catch (error) {
    console.error("Error updating order wallet info:", error);
    throw error;
  }
};

export const getFoodNameById = async (
  foodId: number
): Promise<{ foodName: string; unit: string }> => {
  try {
    const [foodRows]: any = await db
      .promise()
      .query("SELECT name, unit FROM foods WHERE id = ?", [foodId]);

    const food = foodRows[0];
    return {
      foodName: food?.name || "Unknown Food Item",
      unit: food?.unit || "",
    };
  } catch (error) {
    console.error(`Error fetching food name for ID ${foodId}:`, error);
    return {
      foodName: "Unknown Food Item",
      unit: "",
    };
  }
};
