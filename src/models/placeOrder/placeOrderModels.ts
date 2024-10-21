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

  // Search term condition
  if (searchTerm) {
    searchCondition = `AND (p.description LIKE ? OR p.status LIKE ? OR p.method LIKE ?)`;
    const searchValue = `%${searchTerm}%`;
    queryParams.push(searchValue, searchValue, searchValue);
  }

  // Date range condition
  if (startDate) {
    dateCondition += " AND o.order_date >= ?";
    queryParams.push(startDate.toISOString().slice(0, 10));
  }
  if (endDate) {
    dateCondition += " AND o.order_date <= ?";
    queryParams.push(endDate.toISOString().slice(0, 10));
  }

  // Count total number of orders
  const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    LEFT JOIN payments p ON o.payment_id = p.id
    LEFT JOIN order_logs ol ON o.id = ol.order_id
    WHERE o.user_id = ? ${searchCondition} ${dateCondition}
  `;

  const [countRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(countQuery, queryParams);
  const total = countRows[0].total;
  console.log("total", countRows);

  // Main query to fetch orders and related data, including food name from foods table
  const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.order_type,
      o.order_date,
      o.route_id,
      o.hub_id,
      o.locality_id,
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

      fo.id AS food_order_id,
      fo.price AS food_price,
      fo.quantity AS food_quantity,
      fo.created_at AS food_order_created_at,
      fo.updated_at AS food_order_updated_at,

      f.id AS food_id,
      f.name AS food_name,
      f.price AS food_price,
      f.discount_price AS food_discount_price,
      f.description AS food_description,
      f.perma_link AS food_perma_link,
      f.ingredients AS food_ingredients,
      f.package_items_count AS food_package_items_count,
      f.weight AS food_weight,
      f.unit AS food_unit,
      f.sku_code AS food_sku_code,
      f.barcode AS food_barcode,
      f.cgst AS food_cgst,
      f.sgst AS food_sgst,
      f.subscription_type AS food_subscription_type,
      f.track_inventory AS food_track_inventory,
      f.featured AS food_featured,
      f.deliverable AS food_deliverable,
      f.restaurant_id AS food_restaurant_id,
      f.category_id AS food_category_id,
      f.subcategory_id AS food_subcategory_id,
      f.product_type_id AS food_product_type_id,
      f.hub_id AS food_hub_id,
      f.locality_id AS food_locality_id,
      f.product_brand_id AS food_product_brand_id,
      f.weightage AS food_weightage,
      f.status AS food_status,
      f.created_at AS food_created_at,
      f.updated_at AS food_updated_at,

      m.id AS media_id,
      m.model_type,
      m.model_id,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name AS media_file_name,
      m.mime_type AS media_mime_type,
      m.disk,
      m.conversions_disk,
      m.size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url

    FROM 
      orders o
    LEFT JOIN 
      food_orders fo ON o.id = fo.order_id
    LEFT JOIN 
      foods f ON fo.food_id = f.id  
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food' 

    WHERE 
      o.user_id = ? ${dateCondition} ${searchCondition}
    LIMIT ?, ?
  `;

  queryParams.push(offset, limit);

  const [placeOrderRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, queryParams);

  // Structure the result
  const structuredOrders = placeOrderRows.reduce((orders, row) => {
    // Check if the order already exists in the orders list
    let existingOrder = orders.find((order) => order.order_id === row.order_id);

    if (!existingOrder) {
      // If the order doesn't exist, create a new one
      existingOrder = {
        order_id: row.order_id,
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
        created_at: row.order_created_at,
        updated_at: row.order_updated_at,
        food_orders: [],
        total_quantity: 0,
        total_amount: 0,
      };

      orders.push(existingOrder);
    }

    // const foodOriginalPrice = row.food_price ;
    const foodOriginalPrice =
      row.food_discount_price !== null
        ? row.food_discount_price
        : row.food_price;
    const totalFoodItemPrice = foodOriginalPrice * row.food_quantity;


    // Add food order to the existing order
    existingOrder.food_orders.push({
      food_order_id: row.food_order_id,
      foods_id: row.food_id,
      price: row.food_price,
      quantity: row.food_quantity,
      name: row.food_name,
      created_at: row.food_order_created_at,
      updated_at: row.food_order_updated_at,
      discount_price: row.food_discount_price,
      description: row.food_description,
      perma_link: row.food_perma_link,
      ingredients: row.food_ingredients,
      package_items_count: row.food_package_items_count,
      weight: row.food_weight,
      unit: row.food_unit,
      sku_code: row.food_sku_code,
      barcode: row.food_barcode,
      cgst: row.food_cgst,
      sgst: row.food_sgst,
      subscription_type: row.food_subscription_type,
      track_inventory: row.food_track_inventory,
      featured: row.food_featured,
      deliverable: row.food_deliverable,
      restaurant_id: row.food_restaurant_id,
      category_id: row.food_category_id,
      subcategory_id: row.food_subcategory_id,
      product_type_id: row.food_product_type_id,
      hub_id: row.food_hub_id,
      locality_id: row.food_locality_id,
      product_brand_id: row.food_product_brand_id,
      weightage: row.food_weightage,
      status: row.food_status,
      foodOriginalPrice: totalFoodItemPrice,
      media: {
        id: row.media_id,
        model_type: row.model_type,
        model_id: row.model_id,
        uuid: row.uuid,
        collection_name: row.collection_name,
        media_name: row.media_name,
        media_file_name: row.media_file_name,
        mime_type: row.media_mime_type,
        disk: row.disk,
        conversions_disk: row.conversions_disk,
        size: row.size,
        manipulations: row.manipulations,
        custom_properties: row.custom_properties,
        generated_conversions: row.generated_conversions,
        responsive_images: row.responsive_images,
        order_column: row.order_column,
        created_at: row.media_created_at,
        updated_at: row.media_updated_at,
        original_url: row.original_url,
      },
    });

    existingOrder.total_quantity += row.food_quantity;
    existingOrder.total_amount += totalFoodItemPrice;
    return orders;
  }, [] as any[]);

  return { total, placeOrders: structuredOrders };
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

    const deductionSuccess = await deductFromWalletBalance(userId, price);
    if (!deductionSuccess) {
      throw new Error("Failed to deduct from wallet balance.");
    }

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
      null,
      paymentResult.insertId,
      beforeBalance,
      price,
      afterBalance,
      "deduction",
      `Rs ${price} deducted from Rs ${beforeBalance}`,
    ];

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
      1, // Assuming order_type is 1
      route_id,
      hub_id,
      locality_id,
      null, // delivery_boy_id
      1, // order_status_id
      0.0, // tax
      0.0, // delivery_fee
      paymentResult.insertId,
      delivery_address_id,
      1, // is_wallet_deduct
    ];

    const [orderResult]: [OkPacket, any] = await db
      .promise()
      .query(orderSql, orderValues);

    if (orderResult.affectedRows === 0) {
      throw new Error("Failed to create order.");
    }

    const orderId = orderResult.insertId;

    walletLogValues[1] = orderId;
    await db.promise().query(walletLogSql, walletLogValues);

    const cartItems = await getCartItemsByUserId(userId);

    // Insert into food_orders
    for (const item of cartItems) {
      // Use discount_price if available, otherwise fallback to price
      console.log("item", item);

      const finalPrice =
        item.food.discountPrice !== null &&
        item.food.discountPrice !== undefined
          ? item.food.discountPrice
          : item.food.price;
      console.log("finalPrice", finalPrice);

      const foodOrderSql = `
    INSERT INTO food_orders (
      price,
      quantity,
      food_id,
      order_id,
      created_at,
      updated_at
    ) 
    VALUES (?, ?, ?, ?, NOW(), NOW());
  `;

      const foodOrderValues = [
        finalPrice,
        item.quantity,
        item.food_id,
        orderId,
      ];

      await db.promise().query(foodOrderSql, foodOrderValues);
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

// The deleteAllCartItemsByUserId
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
export const getPlaceOrderById = async (orderId: number): Promise<any> => {
  const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.order_type,
      o.order_date,
      o.route_id,
      o.hub_id,
      o.locality_id,
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

      fo.id AS food_order_id,
      fo.price AS food_price,
      fo.quantity AS food_quantity,
      fo.created_at AS food_order_created_at,
      fo.updated_at AS food_order_updated_at,

      f.id AS food_id,
      f.name AS food_name,
      f.price AS food_price,
      f.discount_price AS food_discount_price,
      f.description AS food_description,
      f.perma_link AS food_perma_link,
      f.ingredients AS food_ingredients,
      f.package_items_count AS food_package_items_count,
      f.weight AS food_weight,
      f.unit AS food_unit,
      f.sku_code AS food_sku_code,
      f.barcode AS food_barcode,
      f.cgst AS food_cgst,
      f.sgst AS food_sgst,
      f.subscription_type AS food_subscription_type,
      f.track_inventory AS food_track_inventory,
      f.featured AS food_featured,
      f.deliverable AS food_deliverable,
      f.restaurant_id AS food_restaurant_id,
      f.category_id AS food_category_id,
      f.subcategory_id AS food_subcategory_id,
      f.product_type_id AS food_product_type_id,
      f.hub_id AS food_hub_id,
      f.locality_id AS food_locality_id,
      f.product_brand_id AS food_product_brand_id,
      f.weightage AS food_weightage,
      f.status AS food_status,
      f.created_at AS food_created_at,
      f.updated_at AS food_updated_at,

      m.id AS media_id,
      m.model_type,
      m.model_id,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name AS media_file_name,
      m.mime_type AS media_mime_type,
      m.disk,
      m.conversions_disk,
      m.size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url

    FROM 
      orders o
    LEFT JOIN 
      food_orders fo ON o.id = fo.order_id
    LEFT JOIN 
      foods f ON fo.food_id = f.id  
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food' 

    WHERE 
      o.id = ?
  `;

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, [orderId]);

  if (rows.length === 0) {
    return null; // No order found
  }

  // Structure the result
  const structuredOrder = rows.reduce((order, row) => {
    if (!order) {
      order = {
        order_id: row.order_id,
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
        created_at: row.order_created_at,
        updated_at: row.order_updated_at,
        food_orders: [],
        total_quantity: 0,
        total_amount: 0,
      };
    }

    const foodOriginalPrice =
    row.food_discount_price !== null
      ? row.food_discount_price
      : row.food_price;

    const totalFoodItemPrice = foodOriginalPrice * row.food_quantity;
    const totaloodItemPrice = row.food_price * row.food_quantity;

    // Add food order to the existing order
    order.food_orders.push({
      food_order_id: row.food_order_id,
      foods_id: row.food_id,
      price: row.food_price,
      quantity: row.food_quantity,
      name: row.food_name,
      created_at: row.food_order_created_at,
      updated_at: row.food_order_updated_at,
      discount_price: row.food_discount_price,
      description: row.food_description,
      perma_link: row.food_perma_link,
      ingredients: row.food_ingredients,
      package_items_count: row.food_package_items_count,
      weight: row.food_weight,
      unit: row.food_unit,
      sku_code: row.food_sku_code,
      barcode: row.food_barcode,
      cgst: row.food_cgst,
      sgst: row.food_sgst,
      subscription_type: row.food_subscription_type,
      track_inventory: row.food_track_inventory,
      featured: row.food_featured,
      deliverable: row.food_deliverable,
      restaurant_id: row.food_restaurant_id,
      category_id: row.food_category_id,
      subcategory_id: row.food_subcategory_id,
      product_type_id: row.food_product_type_id,
      hub_id: row.food_hub_id,
      locality_id: row.food_locality_id,
      product_brand_id: row.food_product_brand_id,
      weightage: row.food_weightage,
      status: row.food_status,
      foodOriginalPrice: totalFoodItemPrice,
      media: {
        id: row.media_id,
        model_type: row.model_type,
        model_id: row.model_id,
        uuid: row.uuid,
        collection_name: row.collection_name,
        media_name: row.media_name,
        media_file_name: row.media_file_name,
        mime_type: row.mime_type,
        disk: row.disk,
        conversions_disk: row.conversions_disk,
        size: row.size,
        manipulations: row.manipulations,
        custom_properties: row.custom_properties,
        generated_conversions: row.generated_conversions,
        responsive_images: row.responsive_images,
        order_column: row.order_column,
        created_at: row.media_created_at,
        updated_at: row.media_updated_at,
        original_url: row.original_url,
      },
    });
    console.log("foodOriginalPrice", foodOriginalPrice);

    order.total_amount += totalFoodItemPrice;
    order.total_quantity += row.food_quantity;

    return order;
  }, null as any);

  return structuredOrder;
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
      description: row.description
        ? row.description.replace(/<\/?[^>]+(>|$)/g, "")
        : null,
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
