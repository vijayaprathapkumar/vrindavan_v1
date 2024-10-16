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
export const getAllPlaceOrders = async (
  userId: number,
  page: number,
  limit: number,
  startDate?: Date,
  endDate?: Date,
  searchTerm?: string | null
): Promise<{ total: number; placeOrders: any[] }> => {
  const offset = (page - 1) * limit;

  let searchCondition = "";
  let dateCondition = "";
  let queryParams: (number | string)[] = [userId];

  if (searchTerm) {
    searchCondition = `
      AND (p.description LIKE ? OR p.status LIKE ? OR p.method LIKE ?)
    `;
    const searchValue = `%${searchTerm}%`;
    queryParams.push(searchValue, searchValue, searchValue);
  }

  if (startDate) {
    dateCondition += " AND o.order_date >= ?";
    queryParams.push(startDate.toISOString().slice(0, 10)); 
  }
  if (endDate) {
    dateCondition += " AND o.order_date <= ?";
    queryParams.push(endDate.toISOString().slice(0, 10));
  }

  const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    INNER JOIN payments p ON o.payment_id = p.id
    INNER JOIN order_logs ol ON o.id = ol.order_id
    WHERE ol.user_id = ? ${searchCondition} ${dateCondition}
  `;

  const [countRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(countQuery, queryParams);
  const total = countRows[0].total;

  const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.order_type,
      o.order_date,
      o.route_id,
      o.hub_id AS order_Hub_id,
      o.locality_id AS order_locality_id,
      o.delivery_boy_id,
      o.order_status_id,
      o.tax,
      o.delivery_fee,
      o.hint,
      o.active,
      o.driver_id,
      o.delivery_address_id,
      o.payment_id,
      o.is_wallet_deduct,
      o.delivery_status,
      o.created_at AS order_created_at,
      o.updated_at AS order_updated_at,

      p.id AS payment_id,
      p.price AS payment_price,
      p.description AS payment_description,
      p.status AS payment_status,
      p.method AS payment_method,
      p.created_at AS payment_created_at,
      p.updated_at AS payment_updated_at,

      os.status AS order_status,

      ol.id AS order_log_id,
      ol.order_date AS order_log_date,
      ol.user_id AS order_log_user_id,
      ol.order_id AS order_log_order_id,
      ol.product_id AS order_log_product_id,
      ol.locality_id AS order_log_locality_id,
      ol.delivery_boy_id AS order_log_delivery_boy_id,
      ol.is_created AS order_log_is_created,
      ol.logs AS order_log_logs,
      ol.created_at AS order_log_created_at,
      ol.updated_at AS order_log_updated_at,

      oc.id AS order_combo_id,
      oc.price AS combo_price,
      oc.quantity AS combo_quantity,
      oc.combo_id AS combo_id,
      oc.order_id AS combo_order_id,
      oc.created_at AS combo_created_at,
      oc.updated_at AS combo_updated_at,

      ocd.id AS order_combo_detail_id,
      ocd.order_combo_id AS ocd_order_combo_id,
      ocd.order_id AS ocd_order_id,
      ocd.product_id AS ocd_product_id,
      ocd.created_at AS detail_created_at,
      ocd.updated_at AS detail_updated_at,

      f.id AS food_id,
      f.name AS food_name,
      f.price AS food_price,
      f.discount_price,
      f.description AS food_description,
      f.perma_link,
      f.ingredients,
      f.package_items_count,
      f.weight,
      f.unit,
      f.sku_code,
      f.barcode,
      f.cgst,
      f.sgst,
      f.subscription_type,
      f.track_inventory,
      f.featured,
      f.deliverable,
      f.restaurant_id,
      f.category_id,
      f.subcategory_id,
      f.product_type_id,
      f.hub_id,
      f.locality_id,
      f.product_brand_id,
      f.weightage,
      f.status,
      f.created_at AS food_created_at,
      f.updated_at AS food_updated_at,
      f.food_locality
    FROM orders o
  LEFT JOIN payments p ON o.payment_id = p.id
  LEFT JOIN order_logs ol ON o.id = ol.order_id
   LEFT JOIN foods f ON ol.product_id = f.id
  LEFT JOIN order_statuses os ON o.order_status_id = os.id
  LEFT JOIN order_combos oc ON o.id = oc.order_id
  LEFT JOIN order_combo_details ocd ON oc.id = ocd.order_combo_id
    WHERE ol.user_id = ? ${searchCondition} ${dateCondition}
    ORDER BY o.order_date DESC
    LIMIT ?, ?;
  `;

  queryParams.push(offset, limit);

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, queryParams);
  
  const placeOrders: any[] = [];

  rows.forEach((row) => {
    let order = placeOrders.find((o) => o.order_id === row.order_id);
    if (!order) {
      order = {
        order_id: row.order_id,
        user_id: row.user_id,
        order_date: row.order_date,
        created_at: row.order_created_at,
        order_type: row.order_type,
        route_id: row.route_id,
        hub_id: row.order_Hub_id,
        locality_id: row.order_locality_id,
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
        updated_at: row.order_updated_at,
        status: row.order_status,
        order_logs: [],
        order_combos: [],
        food_items: [],
        payment: {
          id: row.payment_id,
          price: row.payment_price,
          description: row.payment_description,
          status: row.payment_status,
          method: row.payment_method,
          created_at: row.payment_created_at,
          updated_at: row.payment_updated_at,
        },
      };
      placeOrders.push(order);
    }

    order.order_logs.push({
      id: row.order_log_id,
      order_date: row.order_log_date,
      user_id: row.order_log_user_id,
      order_id: row.order_log_order_id,
      product_id: row.order_log_product_id,
      locality_id: row.order_log_locality_id,
      delivery_boy_id: row.delivery_boy_id,
      is_created: row.order_log_is_created,
      logs: row.order_log_logs,
      created_at: row.order_log_created_at,
      updated_at: row.order_log_updated_at,
    });

    if (row.order_combo_id) {
      order.order_combos.push({
        id: row.order_combo_id,
        price: row.combo_price,
        quantity: row.combo_quantity,
        combo_id: row.combo_id,
        order_id: row.combo_order_id,
        created_at: row.combo_created_at,
        updated_at: row.combo_updated_at,
      });
    }

    if (row.food_id) {
      order.food_items.push({
        id: row.food_id,
        name: row.food_name,
        price: row.food_price,
        discount_price: row.discount_price,
        description: row.food_description,
        perma_link: row.perma_link,
        ingredients: row.ingredients,
        package_items_count: row.package_items_count,
        weight: row.weight,
        unit: row.unit,
        sku_code: row.sku_code,
        barcode: row.barcode,
        cgst: row.cgst,
        sgst: row.sgst,
        subscription_type: row.subscription_type,
        track_inventory: row.track_inventory,
        featured: row.featured,
        deliverable: row.deliverable,
        restaurant_id: row.restaurant_id,
        category_id: row.category_id,
        subcategory_id: row.subcategory_id,
        product_type_id: row.product_type_id,
        hub_id: row.hub_id,
        locality_id: row.locality_id,
        product_brand_id: row.product_brand_id,
        weightage: row.weightage,
        status: row.status,
        created_at: row.food_created_at,
        updated_at: row.food_updated_at,
        food_locality: row.food_locality,
      });
    }

  
    order.totalPriceItem = order.food_items.reduce((total, foodItem) => {
      const itemPrice = foodItem.discount_price || foodItem.price;
      return total + itemPrice;
    }, 0);
  });

  return {
    total,
    placeOrders,
  };
};


export const orderTypes = {
  all: "All",
  1: "Instant Order",
  2: "Subscription",
  3: "One Day Order",
  5: "App Order",
};

export const addPlaceOrder = async (placeOrderData: {
  price: number;
  description?: string;
  userId: number;
  status: string;
  method: string;
}) => {
  const { price, description, userId, status, method } = placeOrderData;
  const defaultDescription =
    description || `Default place order for user ${userId}`;

  // Insert payment record
  const paymentSql = `
    INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;

  const paymentValues = [price, defaultDescription, userId, status, method];

  try {
    const [paymentResult]: [OkPacket, any] = await db
      .promise()
      .query(paymentSql, paymentValues);

    if (paymentResult.affectedRows === 0) {
      throw new Error("Payment insertion failed.");
    }

    // Fetch current wallet balance
    const walletBalanceSql = `
      SELECT balance FROM wallet_balances WHERE user_id = ?;
    `;
    
    const [walletRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(walletBalanceSql, [userId]);

    if (walletRows.length === 0) {
      throw new Error(`No wallet balance found for user ${userId}.`);
    }

    const beforeBalance = walletRows[0].balance;
    const afterBalance = (beforeBalance - price).toFixed(2);

    // Deduct amount from user's wallet
    const deductionSuccess = await deductFromWalletBalance(userId, price);
    if (!deductionSuccess) {
      throw new Error("Failed to deduct from wallet balance.");
    }

    // Insert into wallet_logs
    const walletLogSql = `
      INSERT INTO wallet_logs (
        user_id, 
        order_id, 
        order_date, 
        order_item_id, 
        before_balance, 
        amount, 
        after_balance, 
        wallet_type, 
        description, 
        created_at, 
        updated_at
      ) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;

    const walletLogValues = [
      userId,
      null, // order_id will be updated later
      paymentResult.insertId,  // order_item_id is now the payment id
      beforeBalance,
      price,
      afterBalance,
      'deduction', 
      `Rs ${price} deducted from Rs ${beforeBalance}`, 
    ];

    // Address SQL Query
    const addressSql = `
      SELECT da.id AS delivery_address_id, da.*, l.route_id, l.hub_id, l.name AS locality_name
      FROM delivery_addresses da
      LEFT JOIN localities l ON da.locality_id = l.id
      WHERE da.user_id = ?;
    `;

    const [addressRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(addressSql, [userId]);

    if (
      addressRows.length === 0 ||
      !addressRows[0].locality_id ||
      !addressRows[0].hub_id
    ) {
      throw new Error(
        `Missing locality or hub information for user ${userId}. Please add the correct address details.`
      );
    }

    const addressData = addressRows[0];
    const { route_id, hub_id, locality_id, delivery_address_id } = addressData;

    // Insert order record
    const orderSql = `
      INSERT INTO orders (
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
        payment_id, 
        delivery_address_id,
        is_wallet_deduct, 
        created_at, 
        updated_at
      ) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;

    const orderValues = [
      userId,
      1,
      route_id,
      hub_id,
      locality_id,
      null,
      1,
      0.0,
      0.0,
      paymentResult.insertId,
      delivery_address_id,
      1,
    ];

    const [orderResult]: [OkPacket, any] = await db
      .promise()
      .query(orderSql, orderValues);

    if (orderResult.affectedRows === 0) {
      throw new Error("Failed to create order.");
    }

    const orderId = orderResult.insertId; 

    // Update wallet log with the correct order_id
    walletLogValues[1] = orderId; 
    await db.promise().query(walletLogSql, walletLogValues);

    // Log cart items
    const cartItems = await getCartItemsByUserId(userId);
    for (const item of cartItems) {
      const logSql = `
        INSERT INTO order_logs (
          order_date, 
          user_id, 
          order_id, 
          product_id, 
          locality_id, 
          delivery_boy_id, 
          is_created, 
          logs, 
          created_at, 
          updated_at
        ) 
        VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
      `;
      const logValues = [
        userId,
        orderId,
        item.food_id,
        locality_id,
        null,
        1,
        "Stock Available, Order Created",
      ];

      await db.promise().query(logSql, logValues);
    }

    await insertIntoOrderPayment(userId, paymentResult.insertId);

    return paymentResult;
  } catch (error) {
    console.error("SQL Error in addPlaceOrder:", error);
    throw new Error("Failed to add place order.");
  }
};


export const getPriceForNextOrder = async (
  userId: number
): Promise<number | null> => {
  const sql = `SELECT price FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;`;

  try {
    const [rows]: [RowDataPacket[], any] = await db
      .promise()
      .query(sql, [userId]);
    return rows.length > 0 ? rows[0].price : null;
  } catch (error) {
    console.error("Error fetching price:", error);
    throw new Error("Failed to fetch price for the user.");
  }
};

// Update a place order and wallet balance
export const updatePlaceOrder = async (
  id: number,
  placeOrderData: {
    price: number;
    description: string;
    status: string;
    method: string;
  }
) => {
  const { price, description, status, method } = placeOrderData;

  const currentOrderSql = `SELECT price, user_id FROM payments WHERE id = ?`;

  try {
    const [currentOrderRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(currentOrderSql, [id]);

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

    const [result]: [OkPacket, any] = await db
      .promise()
      .query(sql, [price, description, status, method, id]);

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
export const insertIntoOrderPayment = async (
  userId: number,
  paymentId: number
) => {
  const orderSql = `
    UPDATE orders
    SET payment_id = ?, updated_at = NOW()
    WHERE user_id = ? AND order_status_id = 1;
  `;

  const orderValues = [paymentId, userId];

  try {
    const [result]: [OkPacket, any] = await db
      .promise()
      .query(orderSql, orderValues);
    if (result.affectedRows === 0) {
      throw new Error("No active order found for the user to update.");
    }
  } catch (error) {
    console.error("SQL Error in insertIntoOrderPayment:", error);
    throw new Error("Failed to update order with payment details.");
  }
};

export const deductFromWalletBalance = async (
  userId: number,
  amount: number
): Promise<boolean> => {
  const sql = `
    UPDATE wallet_balances 
    SET balance = balance - ? 
    WHERE user_id = ?;
  `;

  try {
    const [result]: [OkPacket, any] = await db
      .promise()
      .query(sql, [amount, userId]);

    if (result.affectedRows === 0) {
      throw new Error("Wallet balance not found for the user.");
    }
    return true;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return false;
  }
};

// The deleteAllCartItemsByUserId function to remove all cart items for the user
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

// Fetch a place order by ID
export const getPlaceOrderById = async (
  id: number
): Promise<PlaceOrder | null> => {
  const sql = `SELECT * FROM payments WHERE id = ?;`;

  try {
    const [rows]: [RowDataPacket[], any] = await db.promise().query(sql, [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      price: row.price,
      description: row.description,
      user_id: row.user_id,
      status: row.status,
      method: row.method,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error("Failed to fetch place order by ID.");
  }
};

export const getCartItemsByUserId = async (userId: number): Promise<any[]> => {
  const query = `
    SELECT 
      c.created_at AS created_at,
      c.id AS cart_id, 
      c.food_id, 
      c.user_id, 
      c.quantity, 
      c.updated_at,
      f.id AS food_id,
      f.name AS food_name,
      f.price,
      f.discount_price,
      f.description,
      f.perma_link,
      f.ingredients,
      f.package_items_count,
      f.weight,
      f.unit,
      f.sku_code,
      f.barcode,
      f.cgst,
      f.sgst,
      f.track_inventory,
      f.featured,
      f.deliverable,
      f.restaurant_id,
      f.category_id,
      f.subcategory_id,
      f.product_type_id,
      f.hub_id,
      f.locality_id,
      f.product_brand_id,
      f.weightage,
      f.status,
      f.food_locality
    FROM 
      carts c
    JOIN 
      foods f ON c.food_id = f.id
    WHERE 
      c.user_id = ?
    ORDER BY c.created_at DESC

  `;

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, [userId]);
  return rows.map((row) => ({
    id: row.cart_id,
    food_id: row.food_id,
    user_id: row.user_id,
    quantity: row.quantity,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    food: {
      id: row.food_id,
      name: row.food_name,
      price: row.price,
      discountPrice: row.discount_price,
      description: row.description,
      permaLink: row.perma_link,
      ingredients: row.ingredients,
      packageItemsCount: row.package_items_count,
      weight: row.weight,
      unit: row.unit,
      skuCode: row.sku_code,
      barcode: row.barcode,
      cgst: row.cgst,
      sgst: row.sgst,
      trackInventory: row.track_inventory,
      featured: row.featured,
      deliverable: row.deliverable,
      restaurantId: row.restaurant_id,
      categoryId: row.category_id,
      subcategoryId: row.subcategory_id,
      productTypeId: row.product_type_id,
      hubId: row.hub_id,
      localityId: row.locality_id,
      productBrandId: row.product_brand_id,
      weightage: row.weightage,
      status: row.status,
      foodLocality: row.food_locality,
    },
  }));
};
