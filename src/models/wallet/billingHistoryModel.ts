import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

export const getOrdersBilling = async (
  userId: number,
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string
) => {
  try {
    const walletBalanceSql = `
            SELECT balance, created_at AS balance_created_at 
            FROM wallet_balances 
            WHERE user_id = ?;
        `;
    const [walletBalanceRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(walletBalanceSql, [userId]);

    if (walletBalanceRows.length === 0) {
      throw new Error(`No wallet balance found for user ${userId}.`);
    }

    const currentBalance = walletBalanceRows[0].balance;

    let dateCondition = "";
    const queryParams: (string | number)[] = [userId];

    if (startDate) {
      dateCondition += " AND wl.order_date >= ?";
      queryParams.push(startDate);
    }
    if (endDate) {
      dateCondition += " AND wl.order_date <= ?";
      queryParams.push(endDate);
    }

    const offset = (page - 1) * limit;

    const walletLogsSql = `
            SELECT 
                wl.id AS log_id, 
                wl.order_id, 
                wl.order_date AS wallet_log_order_date, 
                wl.order_item_id, 
                wl.before_balance, 
                wl.amount, 
                wl.after_balance, 
                wl.wallet_type, 
                wl.description, 
                wl.created_at AS log_created_at,
                o.order_type,
                o.order_date AS order_date,
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
                ol.id AS log_entry_id,
                ol.product_id,
                ol.locality_id AS log_locality_id,
                ol.delivery_boy_id AS log_delivery_boy_id,
                ol.is_created,
                ol.logs AS order_log,
                ol.created_at AS order_log_created_at,
                ol.updated_at AS order_log_updated_at,
                f.id AS food_id,
                f.name AS food_name,
                f.price AS food_price,
                f.discount_price AS food_discount_price,
                f.description AS food_description,
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
                f.updated_at AS food_updated_at
            FROM wallet_logs wl 
            LEFT JOIN orders o ON wl.order_id = o.id
            LEFT JOIN order_logs ol ON o.id = ol.order_id
            LEFT JOIN foods f ON ol.product_id = f.id
            WHERE wl.user_id = ? 
            ${dateCondition}
            ORDER BY wl.created_at DESC 
            LIMIT ? OFFSET ?; 
        `;

    queryParams.push(limit, offset);

    const [walletLogsRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(walletLogsSql, queryParams);

    const structuredLogs = walletLogsRows.map((log) => {
      const foodDiscountPrice =
        log.food_discount_price !== null
          ? log.food_discount_price
          : log.food_price;

      return {
        logId: log.log_id,
        orderId: log.order_id,
        orderDate: log.wallet_log_order_date,
        beforeBalance: log.before_balance,
        amount: log.amount,
        afterBalance: log.after_balance,
        walletType: log.wallet_type,
        description: log.description,
        createdAt: log.log_created_at,
        food: {
          foodId: log.food_id,
          foodName: log.food_name,
          foodPrice: log.food_price,
          foodDiscountPrice: log.food_discount_price,
          foodDescription: log.food_description
            ? log.food_description.replace(/<\/?[^>]+(>|$)/g, "")
            : null,
          foodIngredients: log.food_ingredients,
          foodPackageItemsCount: log.food_package_items_count,
          foodWeight: log.food_weight,
          foodUnit: log.food_unit,
          foodSkuCode: log.food_sku_code,
          foodBarcode: log.food_barcode,
          foodCgst: log.food_cgst,
          foodSgst: log.food_sgst,
          foodSubscriptionType: log.food_subscription_type,
          foodTrackInventory: log.food_track_inventory,
          foodFeatured: log.food_featured,
          foodDeliverable: log.food_deliverable,
          foodRestaurantId: log.food_restaurant_id,
          foodCategoryId: log.food_category_id,
          foodSubcategoryId: log.food_subcategory_id,
          foodProductTypeId: log.food_product_type_id,
          foodHubId: log.food_hub_id,
          foodLocalityId: log.food_locality_id,
          foodBrandId: log.food_product_brand_id,
          foodWeightage: log.food_weightage,
          foodStatus: log.food_status,
          foodCreatedAt: log.food_created_at,
          foodUpdatedAt: log.food_updated_at,
        },
        totalFoodItemPrice: foodDiscountPrice,
        order: {
          orderType: log.order_type,
          orderDate: log.order_date,
          routeId: log.route_id,
          hubId: log.hub_id,
          localityId: log.locality_id,
          deliveryBoyId: log.delivery_boy_id,
          orderStatusId: log.order_status_id,
          tax: log.tax,
          deliveryFee: log.delivery_fee,
          hint: log.hint,
          active: log.active,
          driverId: log.driver_id,
          deliveryAddressId: log.delivery_address_id,
          paymentId: log.payment_id,
          isWalletDeduct: log.is_wallet_deduct,
          deliveryStatus: log.delivery_status,
          orderCreatedAt: log.order_created_at,
          orderUpdatedAt: log.order_updated_at,
        },
        orderLog: {
          logEntryId: log.log_entry_id,
          productId: log.product_id,
          localityId: log.log_locality_id,
          deliveryBoyId: log.log_delivery_boy_id,
          isCreated: log.is_created,
          logs: log.order_log,
          orderLogCreatedAt: log.order_log_created_at,
          orderLogUpdatedAt: log.order_log_updated_at,
        },
      };
    });

    const billingInfo = {
      currentBalance,
      walletLogs: structuredLogs,
    };

    return billingInfo;
  } catch (error) {
    console.error("SQL Error in getOrdersBilling:", error);
    throw new Error("Failed to retrieve orders billing information.");
  }
};

export const getTotalOrderBillingHistoryCount = async (
  userId: number,
  startDate?: string,
  endDate?: string,
  searchTerm?: string // Include searchTerm parameter
): Promise<number> => {
  let countSql = `
        SELECT COUNT(*) AS totalCount
        FROM wallet_logs wl
        LEFT JOIN orders o ON wl.order_id = o.id
        LEFT JOIN food_orders fo ON o.id = fo.order_id
        LEFT JOIN foods f ON fo.food_id = f.id
        WHERE wl.user_id = ? 
    `;

  const queryParams: (string | number)[] = [userId];

  if (startDate) {
    countSql += " AND wl.order_date >= ?";
    queryParams.push(startDate);
  }

  if (endDate) {
    countSql += " AND wl.order_date <= ?";
    queryParams.push(endDate);
  }

  if (searchTerm) {
    countSql += " AND f.name LIKE ?";
    queryParams.push(`%${searchTerm}%`);
  }

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(countSql, queryParams);

  return rows[0].totalCount;
};

//apifor mobile
export const getOrdersBillingForMobile = async (
  userId: number,
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
  searchTerm?: string
) => {
  try {
    // Fetch wallet balance
    const walletBalanceSql = `
      SELECT balance, created_at AS balance_created_at 
      FROM wallet_balances 
      WHERE user_id = ?;
    `;
    const [walletBalanceRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(walletBalanceSql, [userId]);

    if (walletBalanceRows.length === 0) {
      throw new Error(`No wallet balance found for user ${userId}.`);
    }

    const currentBalance = walletBalanceRows[0].balance;

    // Initialize date and search conditions
    let dateCondition = '';
    let searchCondition = '';
    const queryParams: (string | number)[] = [userId];

    // Build the conditions only if the parameters are provided
    if (startDate) {
      dateCondition += " AND wl.order_date >= ?";
      queryParams.push(startDate);
    }
    if (endDate) {
      dateCondition += " AND wl.order_date <= ?";
      queryParams.push(endDate);
    }
    if (searchTerm) {
      searchCondition += " AND f.name LIKE ?";
      queryParams.push(`%${searchTerm}%`);
    }

    const offset = (page - 1) * limit;

    // Update the walletLogsSql to include food order details
    const walletLogsSql = `
      SELECT 
        wl.id AS log_id, 
        wl.order_id, 
        wl.order_date AS wallet_log_order_date, 
        wl.order_item_id, 
        wl.before_balance, 
        wl.amount, 
        wl.after_balance, 
        wl.wallet_type, 
        wl.description, 
        wl.created_at AS log_created_at,
        fo.food_id,
        f.name AS food_name,
        f.price AS food_price,
        f.discount_price,
        fo.quantity AS food_quantity,
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
        o.updated_at AS order_updated_at
      FROM wallet_logs wl 
      LEFT JOIN orders o ON wl.order_id = o.id
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      WHERE wl.user_id = ? 
      ${dateCondition} 
      ${searchCondition} 
      ORDER BY wl.created_at DESC 
      LIMIT ? OFFSET ?;
    `;

    queryParams.push(limit, offset);

    const [walletLogsRows]: [RowDataPacket[], any] = await db
      .promise()
      .query(walletLogsSql, queryParams);

    // Count total records for the given conditions
    const countSql = `
      SELECT COUNT(DISTINCT wl.id) AS totalRecords
      FROM wallet_logs wl 
      LEFT JOIN orders o ON wl.order_id = o.id
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      WHERE wl.user_id = ? 
      ${dateCondition} 
      ${searchCondition};
    `;

    const [countRows]: [RowDataPacket[], any] = await db.promise().query(countSql, queryParams);

    const totalRecords = countRows[0]?.totalRecords || 0;

    // Group wallet logs and food details
    const groupedLogs = walletLogsRows.reduce((acc, log) => {
      let existingLog = acc.find((item) => item.orderId === log.order_id);
    
      if (!existingLog) {
        existingLog = {
          logId: log.log_id,
          orderId: log.order_id,
          orderDate: log.wallet_log_order_date,
          beforeBalance: log.before_balance,
          amount: log.amount,
          afterBalance: log.after_balance,
          walletType: log.wallet_type,
          description: log.description,
          createdAt: log.log_created_at,
          foods: [],
          totalQuantity: 0,
          totalPrice: 0,
        };
        acc.push(existingLog);
      }
    
      const foodPrice = log.discount_price !== null ? log.discount_price : log.food_price;
    
      if (log.food_id) {
        let existingFood = existingLog.foods.find((food) => food.foodId === log.food_id);
    
        if (existingFood) {
          // Update existing food entry by adding quantity and recalculating price
          existingFood.foodQuantity += log.food_quantity;
          existingFood.foodOriginalPrice += foodPrice * log.food_quantity;
        } else {
          // Add new food entry if not already present
          existingLog.foods.push({
            foodId: log.food_id,
            foodName: log.food_name,
            foodPrice: log.food_price,
            discountPrice: log.discount_price,
            foodQuantity: log.food_quantity,
            foodOriginalPrice: foodPrice * log.food_quantity,
            orderId: log.order_id,
          });
        }
    
        // Update total quantity and total price for the order log
        existingLog.totalQuantity += log.food_quantity;
        existingLog.totalPrice += foodPrice * log.food_quantity;
      }
    
      return acc;
    }, []);
    

    const billingInfo = {
      currentBalance,
      walletLogs: groupedLogs,
      totalRecords,
    };

    return billingInfo;
  } catch (error) {
    console.error("SQL Error in getOrdersBillingForMobile:", error);
    throw new Error("Failed to retrieve orders billing information.");
  }
};