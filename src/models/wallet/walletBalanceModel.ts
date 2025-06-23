import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

export interface WalletBalance {
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const getWalletBalanceByUserId = (
  userId: string
): Promise<WalletBalance | null> => {
  const query = `
        SELECT user_id, balance, created_at, updated_at
        FROM wallet_balances
        WHERE user_id = ?
    `;

  return new Promise((resolve, reject) => {
    db.query(query, [userId], (err, results: any[]) => {
      if (err) {
        return reject(err);
      }

      if (!results || results.length === 0) {
        return resolve(null);
      }

      const result = results[0];
      const walletBalance: WalletBalance = {
        user_id: result.user_id,
        balance: parseFloat(result.balance),
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
      resolve(walletBalance);
    });
  });
};
export const getWalletBalanceByWithOutUserId = async (
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
  searchTerm?: string,
  sortField?: string,
  sortOrder?: string
): Promise<{ walletBalances: WalletBalance[] | null; totalCount: number }> => {
  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM 
      wallet_balances wb
    INNER JOIN 
      users u ON wb.user_id = u.id
    LEFT JOIN 
      delivery_addresses da ON da.user_id = u.id
    LEFT JOIN 
      localities l ON da.locality_id = l.id
    INNER JOIN (
      SELECT DISTINCT user_id
      FROM orders
      WHERE order_date BETWEEN CURDATE() - INTERVAL 4 DAY AND CURDATE()
    ) active_users ON active_users.user_id = wb.user_id
    WHERE 1=1
    AND wb.balance < 200
  `;

  const params: any[] = [];

  if (startDate) {
    baseQuery += ` AND wb.created_at >= ?`;
    params.push(`${startDate} 00:00:00`);
  }

  if (endDate) {
    baseQuery += ` AND wb.created_at <= ?`;
    params.push(`${endDate} 23:59:59`);
  }

  if (searchTerm) {
    baseQuery += ` 
      AND (
        u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? 
        OR l.name LIKE ? OR da.complete_address LIKE ? OR wb.balance LIKE ?
      )`;
    params.push(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
  }

  const allowedSortFields: Record<string, string> = {
    user_name: "u.name",
    email: "u.email",
    phone: "u.phone",
    locality_name: "l.name",
    complete_address: "da.complete_address",
    balance: "wb.balance",
  };

  let orderByClause = "";
  if (sortField && allowedSortFields[sortField]) {
    const validSortOrder = sortOrder === "desc" ? "DESC" : "ASC";
    orderByClause = ` ORDER BY ${allowedSortFields[sortField]} ${validSortOrder}`;
  } else {
    orderByClause = ` ORDER BY wb.created_at DESC`;
  }

  const countQuery = `SELECT COUNT(*) as totalCount ${baseQuery}`;

  let dataQuery = `
    SELECT 
      wb.*,
      u.id AS user_id, u.name AS user_name, u.email, u.phone,
      da.id AS delivery_address_id, da.description AS address_description, da.address, 
      da.latitude AS address_latitude, da.longitude AS address_longitude, 
      da.house_no, da.complete_address, da.is_default,
      l.id AS locality_id, l.name AS locality_name, l.address AS locality_address, 
      l.google_address, l.latitude AS locality_latitude, l.longitude AS locality_longitude, l.city
    ${baseQuery}
    ${orderByClause}
  `;

  if (limit > 0) {
    dataQuery += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
  }

  try {
    // Execute count query
    const [countResult]: [RowDataPacket[], any] = await db
      .promise()
      .query(countQuery, limit > 0 ? params.slice(0, -2) : params);
    const totalCount = countResult[0].totalCount;

    // Execute data query
    const [walletBalances]: [RowDataPacket[], any] = await db
      .promise()
      .query(dataQuery, params);

    return {
      walletBalances: walletBalances.length > 0 ? (walletBalances as WalletBalance[]) : null,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw new Error("Failed to retrieve wallet balance");
  }
};

export interface WalletLog {
  id: number;
  user_id: number;
  order_id: number;
  order_date: string;
  order_item_id: number;
  before_balance: number;
  amount: number;
  after_balance: number;
  wallet_type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

//wallet logs
export const getWalletLogsWithFoodDetails = async (
  userId: string,
  page: number,
  limit: number
): Promise<any[] | null> => {
  try {
    const query = `
        SELECT 
          wl.id AS wallet_log_id,
          wl.user_id,
          wl.order_id,
          wl.order_date,
          wl.order_item_id,
          wl.before_balance,
          wl.amount,
          wl.after_balance,
          wl.wallet_type,
          wl.description,
          wl.created_at,
          wl.updated_at,
    
          fo.id AS food_order_id,
          fo.price,
          fo.quantity,
          fo.food_id,
          fo.created_at AS food_order_created_at,
          fo.updated_at AS food_order_updated_at,
    
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
          m.model_id,
          m.file_name,
          m.mime_type,
          m.disk,
          m.conversions_disk,
          m.size,
          m.manipulations,
          m.custom_properties,
          m.generated_conversions,
          m.responsive_images,
          m.order_column,
          CASE 
            WHEN m.conversions_disk = 'public1' 
            THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
            ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
          END AS original_url
        FROM wallet_logs wl
        LEFT JOIN food_orders fo ON wl.order_id = fo.order_id
        LEFT JOIN foods f ON fo.food_id = f.id
        LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
        WHERE wl.user_id = ?
        ORDER BY wl.updated_at DESC
        LIMIT ? OFFSET ?;
      `;

    const [rows]: [RowDataPacket[], any] = await db
      .promise()
      .query(query, [userId, limit, (page - 1) * limit]);

    if (rows.length === 0) {
      return null;
    }

    const walletLogsWithFoodDetails = rows.map((row) => {
      const totalPrice = parseFloat(row.food_price) * row.quantity;

      const date = new Date(row.order_date);
      const istDate = new Date(
        date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );

      const day = String(istDate.getDate()).padStart(2, "0");
      const month = String(istDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = istDate.getFullYear();

      const istDateOnly = `${day}-${month}-${year}`;

      return {
        wallet_log_id: row.wallet_log_id,
        user_id: row.user_id,
        order_id: istDateOnly,
        order_date: row.order_date,
        order_item_id: row.order_item_id,
        before_balance: parseFloat(row.before_balance),
        amount: parseFloat(row.amount),
        after_balance: parseFloat(row.after_balance),
        wallet_type: row.wallet_type,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,

        food: {
          food_order_id: row.food_order_id,
          price: parseFloat(row.price),
          quantity: row.quantity,
          food_id: row.food_id,
          food_order_created_at: row.food_order_created_at,
          food_order_updated_at: row.food_order_updated_at,
          total_price: totalPrice,
        },

        media: {
          media_id: row.media_id,
          model_id: row.model_id,
          file_name: row.file_name,
          mime_type: row.mime_type,
          disk: row.disk,
          conversions_disk: row.conversions_disk,
          size: row.size,
          manipulations: row.manipulations,
          custom_properties: row.custom_properties,
          generated_conversions: row.generated_conversions,
          responsive_images: row.responsive_images,
          order_column: row.order_column,
          original_url: row.original_url,
        },

        food_details: {
          food_name: row.food_name,
          food_price: parseFloat(row.food_price),
          food_discount_price: parseFloat(row.food_discount_price),
          food_description: row.food_description,
          food_perma_link: row.food_perma_link,
          food_ingredients: row.food_ingredients,
          food_package_items_count: parseFloat(row.food_package_items_count),
          food_weight: parseFloat(row.food_weight),
          food_unit: row.food_unit,
          food_sku_code: row.food_sku_code,
          food_barcode: row.food_barcode,
          food_cgst: row.food_cgst,
          food_sgst: row.food_sgst,
          food_subscription_type: row.food_subscription_type,
          food_track_inventory: row.food_track_inventory,
          food_featured: row.food_featured,
          food_deliverable: row.food_deliverable,
          food_restaurant_id: row.food_restaurant_id,
          food_category_id: row.food_category_id,
          food_subcategory_id: row.food_subcategory_id,
          food_product_type_id: row.food_product_type_id,
          food_hub_id: row.food_hub_id,
          food_locality_id: row.food_locality_id,
          food_product_brand_id: row.food_product_brand_id,
          food_weightage: row.food_weightage,
          food_status: row.food_status,
          food_created_at: row.food_created_at,
          food_updated_at: row.food_updated_at,
        },
      };
    });

    return walletLogsWithFoodDetails;
  } catch (error) {
    console.error(
      "Error fetching wallet logs with food details:",
      error.message
    );
    console.error("Stack Trace:", error.stack);
    throw new Error("Failed to fetch wallet logs with food details");
  }
};

export const getWalletLogsWithFoodDetailsAdmin = async (
  userId: string,
  page: number,
  limit: number
): Promise<{ data: any[]; totalCount: number }> => {
  try {
    const offset = (page - 1) * limit;

    // 1. Get total count of wallet logs for this user
    const countQuery = `
      SELECT COUNT(*) AS totalCount
      FROM wallet_logs
      WHERE user_id = ?;
    `;
    const [countRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(countQuery, [userId]);

    const totalCount = countRows[0]?.totalCount || 0;

    // 2. Get paginated wallet logs
    const walletLogsQuery = `
      SELECT 
        id AS wallet_log_id,
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
      FROM wallet_logs
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?;
    `;

    const [walletLogsRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(walletLogsQuery, [userId, limit, offset]);

    if (walletLogsRows.length === 0) {
      return { data: [], totalCount };
    }

    // 3. Get all order IDs from the wallet logs
    const orderIds = walletLogsRows
      .map((row) => row.order_id)
      .filter((id) => id !== null);

    let foodOrders = [];

    // 4. Only query for food orders if we have order IDs
    if (orderIds.length > 0) {
      const foodOrdersQuery = `
        SELECT 
          fo.id AS food_order_id,
          fo.order_id,
          fo.price,
          fo.quantity,
          fo.food_id,
          fo.created_at AS food_order_created_at,
          fo.updated_at AS food_order_updated_at,

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
          m.model_id,
          m.file_name,
          m.mime_type,
          m.disk,
          m.conversions_disk,
          m.size,
          m.manipulations,
          m.custom_properties,
          m.generated_conversions,
          m.responsive_images,
          m.order_column,
          CASE 
            WHEN m.conversions_disk = 'public1' 
            THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
            ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
          END AS original_url
        FROM food_orders fo
        LEFT JOIN foods f ON fo.food_id = f.id
        LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
        WHERE fo.order_id IN (?);
      `;

      const [foodOrderRows]: [RowDataPacket[], any] = await db
        .promise()
        .query(foodOrdersQuery, [orderIds]);

      foodOrders = foodOrderRows;
    }

    // 5. Group food orders by order_id for efficient lookup
    const foodOrdersByOrderId = foodOrders.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(item);
      return acc;
    }, {});

    // 6. Combine wallet logs with their associated food items
    const data = walletLogsRows.map((row) => {
      const date = new Date(row.order_date);
      const istDate = new Date(
        date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
      const day = String(istDate.getDate()).padStart(2, "0");
      const month = String(istDate.getMonth() + 1).padStart(2, "0");
      const year = istDate.getFullYear();
      const istDateOnly = `${day}-${month}-${year}`;

      const foodItems = foodOrdersByOrderId[row.order_id] || [];

      const formattedFoodItems = foodItems.map((foodItem) => ({
        food_order_id: foodItem.food_order_id,
        price: parseFloat(foodItem.price),
        quantity: foodItem.quantity,
        food_id: foodItem.food_id,
        created_at: foodItem.food_order_created_at,
        updated_at: foodItem.food_order_updated_at,
        total_price: parseFloat(foodItem.price) * foodItem.quantity,

        media: {
          media_id: foodItem.media_id,
          model_id: foodItem.model_id,
          file_name: foodItem.file_name,
          mime_type: foodItem.mime_type,
          disk: foodItem.disk,
          conversions_disk: foodItem.conversions_disk,
          size: foodItem.size,
          manipulations: foodItem.manipulations,
          custom_properties: foodItem.custom_properties,
          generated_conversions: foodItem.generated_conversions,
          responsive_images: foodItem.responsive_images,
          order_column: foodItem.order_column,
          original_url: foodItem.original_url,
        },

        food_details: {
          name: foodItem.food_name,
          price: parseFloat(foodItem.food_price),
          discount_price: parseFloat(foodItem.food_discount_price),
          description: foodItem.food_description,
          perma_link: foodItem.food_perma_link,
          ingredients: foodItem.food_ingredients,
          package_items_count: parseFloat(foodItem.food_package_items_count),
          weight: parseFloat(foodItem.food_weight),
          unit: foodItem.food_unit,
          sku_code: foodItem.food_sku_code,
          barcode: foodItem.food_barcode,
          cgst: foodItem.food_cgst,
          sgst: foodItem.food_sgst,
          subscription_type: foodItem.food_subscription_type,
          track_inventory: foodItem.food_track_inventory,
          featured: foodItem.food_featured,
          deliverable: foodItem.food_deliverable,
          restaurant_id: foodItem.food_restaurant_id,
          category_id: foodItem.food_category_id,
          subcategory_id: foodItem.food_subcategory_id,
          product_type_id: foodItem.food_product_type_id,
          hub_id: foodItem.food_hub_id,
          locality_id: foodItem.food_locality_id,
          product_brand_id: foodItem.food_product_brand_id,
          weightage: foodItem.food_weightage,
          status: foodItem.food_status,
          created_at: foodItem.food_created_at,
          updated_at: foodItem.food_updated_at,
        },
      }));

      return {
        wallet_log_id: row.wallet_log_id,
        user_id: row.user_id,
        order_id: row.order_id,
        order_date: istDateOnly,
        order_item_id: row.order_item_id,
        before_balance: row.before_balance
          ? parseFloat(row.before_balance)
          : null,
        amount: parseFloat(row.amount),
        after_balance: row.after_balance ? parseFloat(row.after_balance) : null,
        wallet_type: row.wallet_type,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,
        food_items: formattedFoodItems,
      };
    });

    return { data, totalCount };
  } catch (error) {
    console.error(
      "Error fetching wallet logs with food details:",
      error.message
    );
    throw new Error("Failed to fetch wallet logs with food details");
  }
};

export const getWalletBalanceUserIdAdmin = async (
  userId: string,
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
  searchTerm?: string,
  sortField?: string,
  sortOrder?: string
): Promise<{
  walletBalancesData: WalletBalance[] | null;
  totalCount: number;
}> => {
  const offset = (page - 1) * limit;

  let baseQuery = `
    FROM 
      wallet_balances wb
    INNER JOIN 
      users u ON wb.user_id = u.id
    LEFT JOIN 
      delivery_addresses da ON da.user_id = u.id
    LEFT JOIN 
      localities l ON da.locality_id = l.id
    WHERE wb.user_id = ?
  `;

  const params: any[] = [userId];

  if (startDate) {
    baseQuery += ` AND wb.created_at >= ?`;
    params.push(`${startDate} 00:00:00`);
  }
  if (endDate) {
    baseQuery += ` AND wb.created_at <= ?`;
    params.push(`${endDate} 23:59:59`);
  }

  if (searchTerm) {
    baseQuery += ` 
      AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? 
      OR l.name LIKE ? OR da.complete_address LIKE ? OR wb.balance LIKE ?)`;
    params.push(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
  }

  // Handle sorting
  const allowedSortFields: Record<string, string> = {
    user_name: "u.name",
    email: "u.email",
    phone: "u.phone",
    locality_name: "l.name",
    complete_address: "da.complete_address",
    balance: "wb.balance",
  };

  let orderByClause = "";
  if (sortField && allowedSortFields[sortField]) {
    const validSortOrder = sortOrder === "desc" ? "DESC" : "ASC";
    orderByClause = ` ORDER BY ${allowedSortFields[sortField]} ${validSortOrder}`;
  } else {
    orderByClause = ` ORDER BY wb.created_at DESC`; // Default sorting
  }

  // Query for total count
  const countQuery = `SELECT COUNT(*) as totalCount ${baseQuery}`;

  // Query for paginated data
  const dataQuery = `
    SELECT 
      wb.*,
      u.id AS user_id, u.name AS user_name, u.email, u.phone,
      da.id AS delivery_address_id, da.description AS address_description, da.address, 
      da.latitude AS address_latitude, da.longitude AS address_longitude, 
      da.house_no, da.complete_address, da.is_default,
      l.id AS locality_id, l.name AS locality_name, l.address AS locality_address, 
      l.google_address, l.latitude AS locality_latitude, l.longitude AS locality_longitude, l.city
    ${baseQuery}
    ${orderByClause}
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  try {
    // Execute count query
    const [countResult]: [RowDataPacket[], any] = await db
      .promise()
      .query(countQuery, params.slice(0, -2)); // Exclude limit and offset for count query
    const totalCount = countResult[0].totalCount;

    // Execute data query
    const [walletBalances]: [RowDataPacket[], any] = await db
      .promise()
      .query(dataQuery, params);

    return {
      walletBalancesData:
        walletBalances.length > 0 ? (walletBalances as WalletBalance[]) : null,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching wallet balance by user ID:", error);
    throw new Error("Failed to retrieve wallet balance by user ID");
  }
};
