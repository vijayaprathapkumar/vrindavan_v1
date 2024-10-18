import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

// interface FoodData {
//     id: number; 
//     name: string;
//     price: number;
//     discount_price: number | null;
//     description: string;
//     perma_link: string;
//     ingredients: string | null;
//     package_items_count: number;
//     weight: number;
//     unit: string;
//     sku_code: string;
//     barcode: string | null;
//     cgst: string | null;
//     sgst: string | null;
//     subscription_type: string;
//     track_inventory: string;
//     featured: number;
//     deliverable: number;
//     restaurant_id: number;
//     category_id: number;
//     subcategory_id: number;
//     product_type_id: number;
//     hub_id: number | null;
//     locality_id: number | null;
//     product_brand_id: number;
//     weightage: number;
//     status: string;
//     created_at: Date;
//     updated_at: Date;
//     food_locality: number;
// }

// interface OrderCombo {
//     id: number;
//     price: string;
//     quantity: number;
//     combo_id: number;
//     order_id: number;
//     created_at: Date;
//     updated_at: Date;
// }

// interface OrderLog {
//     id: number;
//     order_date: Date;
//     user_id: number;
//     order_id: number;
//     product_id: number;
//     locality_id: number | null;
//     delivery_boy_id: number;
//     is_created: number;
//     logs: string;
//     created_at: Date;
//     updated_at: Date;
// }

// interface PaymentData {
//     id: number;
//     deduct_amount: string;
//     description: string;
//     status: string;
//     method: string;
//     created_at: Date;
//     updated_at: Date;
// }

// interface CombinedOrderData {
//     orders: { 
//         order_id: number; 
//         user_id: number; 
//         order_date: Date; 
//         created_at: Date;
//         order_type: string;
//         route_id: number | null;
//         hub_id: number | null;
//         locality_id: number | null;
//         delivery_boy_id: number | null;
//         order_status_id: number | null;
//         tax: number | null;
//         delivery_fee: number | null;
//         hint: string | null;
//         active: number | null;
//         driver_id: number | null;
//         delivery_address_id: number | null;
//         is_wallet_deduct: number | null;
//         delivery_status: number | null;
//         updated_at: Date;
//         status: string;
//         payment: PaymentData | null; 
//         order_logs: OrderLog[];
//         order_combos: OrderCombo[];
//         food_items: FoodData[];
//     }[];
// }

// // Fetch order details for a user
// export const getOrderDetails = async (userId: number, page: number, limit: number): Promise<CombinedOrderData> => {
//     const offset = (page - 1) * limit; 

//     const query = `
//         SELECT 
//             o.id AS order_id,
//             o.user_id,
//             o.order_type,
//             o.order_date,
//             o.route_id,
//             o.hub_id AS order_hub_id,
//             o.locality_id AS order_locality_id,
//             o.delivery_boy_id,
//             o.order_status_id,
//             o.tax,
//             o.delivery_fee,
//             o.hint,
//             o.active,
//             o.driver_id,
//             o.delivery_address_id,
//             o.payment_id,
//             o.is_wallet_deduct,
//             o.delivery_status,
//             o.created_at AS order_created_at,
//             o.updated_at AS order_updated_at,

//             os.status AS order_status,

//             p.id AS payment_id,
//             p.price AS payment_price,
//             p.description AS payment_description,
//             p.status AS payment_status,
//             p.method AS payment_method,
//             p.created_at AS payment_created_at,
//             p.updated_at AS payment_updated_at,

//             ol.id AS order_log_id,
//             ol.order_date AS order_log_date,
//             ol.user_id AS order_log_user_id,
//             ol.order_id AS order_log_order_id,
//             ol.product_id AS order_log_product_id,
//             ol.locality_id AS order_log_locality_id,
//             ol.delivery_boy_id AS order_log_delivery_boy_id,
//             ol.is_created AS order_log_is_created,
//             ol.logs AS order_log_logs,
//             ol.created_at AS order_log_created_at,
//             ol.updated_at AS order_log_updated_at,

//             oc.id AS order_combo_id,
//             oc.price AS combo_price,
//             oc.quantity AS combo_quantity,
//             oc.combo_id AS combo_id,
//             oc.order_id AS combo_order_id,
//             oc.created_at AS combo_created_at,
//             oc.updated_at AS combo_updated_at,

//             ocd.id AS order_combo_detail_id,
//             ocd.order_combo_id AS ocd_order_combo_id,
//             ocd.order_id AS ocd_order_id,
//             ocd.product_id AS ocd_product_id,
//             ocd.created_at AS detail_created_at,
//             ocd.updated_at AS detail_updated_at,

//             f.id AS food_id,
//             f.name AS food_name,
//             f.price AS food_price,
//             f.discount_price,
//             f.description AS food_description,
//             f.perma_link,
//             f.ingredients,
//             f.package_items_count,
//             f.weight,
//             f.unit,
//             f.sku_code,
//             f.barcode,
//             f.cgst,
//             f.sgst,
//             f.subscription_type,
//             f.track_inventory,
//             f.featured,
//             f.deliverable,
//             f.restaurant_id,
//             f.category_id,
//             f.subcategory_id,
//             f.product_type_id,
//             f.hub_id,
//             f.locality_id,
//             f.product_brand_id,
//             f.weightage,
//             f.status,
//             f.created_at AS food_created_at,
//             f.updated_at AS food_updated_at,
//             f.food_locality
//         FROM 
//             orders o
//         INNER JOIN 
//             order_logs ol ON o.id = ol.order_id 
//         LEFT JOIN 
//             order_combos oc ON o.id = oc.order_id
//         LEFT JOIN 
//             payments p ON o.payment_id = p.id
//         LEFT JOIN 
//             order_combo_details ocd ON oc.id = ocd.order_combo_id
//         LEFT JOIN 
//             foods f ON ol.product_id = f.id 
//         LEFT JOIN 
//             order_statuses os ON o.order_status_id = os.id      
//         WHERE 
//             ol.user_id = ? 
//         ORDER BY 
//             o.order_date DESC
//         LIMIT ?, ?; 
//     `;

//     try {
//         const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [userId, offset, limit]);

//         const response: CombinedOrderData = {
//             orders: [],
//         };

//         rows.forEach(row => {
//             let order = response.orders.find(o => o.order_id === row.order_id);
//             if (!order) {
//                 order = {
//                     order_id: row.order_id,
//                     user_id: row.user_id,
//                     order_date: row.order_date,
//                     created_at: row.order_created_at, 
//                     order_type: row.order_type,
//                     route_id: row.route_id,
//                     hub_id: row.order_hub_id,
//                     locality_id: row.order_locality_id,
//                     delivery_boy_id: row.delivery_boy_id,
//                     order_status_id: row.order_status_id,
//                     tax: row.tax,
//                     delivery_fee: row.delivery_fee,
//                     hint: row.hint,
//                     active: row.active,
//                     driver_id: row.driver_id,
//                     delivery_address_id: row.delivery_address_id,
//                     is_wallet_deduct: row.is_wallet_deduct,
//                     delivery_status: row.delivery_status,
//                     updated_at: row.order_updated_at,
//                     status: row.order_status,
//                     payment: null, 
//                     order_logs: [],
//                     order_combos: [],
//                     food_items: [],
//                 };
//                 response.orders.push(order);
//             }

//             if (row.payment_id) {
//                 order.payment = {
//                     id: row.payment_id,
//                     deduct_amount: row.payment_price,
//                     description: row.payment_description,
//                     status: row.payment_status,
//                     method: row.payment_method,
//                     created_at: row.payment_created_at,
//                     updated_at: row.payment_updated_at,
//                 };
//             }

//             if (row.order_log_id) {
//                 order.order_logs.push({
//                     id: row.order_log_id,
//                     order_date: row.order_log_date,
//                     user_id: row.user_id,
//                     order_id: row.order_id,
//                     product_id: row.order_log_product_id,
//                     locality_id: row.order_log_locality_id,
//                     delivery_boy_id: row.order_log_delivery_boy_id,
//                     is_created: row.order_log_is_created,
//                     logs: row.order_log_logs,
//                     created_at: row.order_log_created_at,
//                     updated_at: row.order_log_updated_at,
//                 });
//             }

//             if (row.order_combo_id) {
//                 order.order_combos.push({
//                     id: row.order_combo_id,
//                     price: row.combo_price,
//                     quantity: row.combo_quantity,
//                     combo_id: row.combo_id,
//                     order_id: row.order_id,
//                     created_at: row.combo_created_at,
//                     updated_at: row.combo_updated_at,
//                 });
//             }

//             if (row.food_id) {
//                 order.food_items.push({
//                     id: row.food_id,
//                     name: row.food_name,
//                     price: row.food_price,
//                     discount_price: row.discount_price,
//                     description: row.food_description,
//                     perma_link: row.perma_link,
//                     ingredients: row.ingredients,
//                     package_items_count: row.package_items_count,
//                     weight: row.weight,
//                     unit: row.unit,
//                     sku_code: row.sku_code,
//                     barcode: row.barcode,
//                     cgst: row.cgst,
//                     sgst: row.sgst,
//                     subscription_type: row.subscription_type,
//                     track_inventory: row.track_inventory,
//                     featured: row.featured,
//                     deliverable: row.deliverable,
//                     restaurant_id: row.restaurant_id,
//                     category_id: row.category_id,
//                     subcategory_id: row.subcategory_id,
//                     product_type_id: row.product_type_id,
//                     hub_id: row.hub_id,
//                     locality_id: row.locality_id,
//                     product_brand_id: row.product_brand_id,
//                     weightage: row.weightage,
//                     status: row.status,
//                     created_at: row.food_created_at,
//                     updated_at: row.food_updated_at,
//                     food_locality: row.food_locality,
//                 });
//             }
            
//         });

//         return response;
//     } catch (error) {
//         console.error("Error fetching order details:", error);
//         throw new Error("Could not fetch order details");
//     }
// };

// // Fetch total count of billing history for a user
// export const getTotalBillingHistoryCount = async (userId: number): Promise<number> => {
//     const query = `
//         SELECT 
//             COUNT(*) as total
//         FROM 
//             order_logs ol
//         WHERE 
//             ol.user_id = ?;
//     `;

//     try {
//         const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [userId]);
//         return rows[0].total;
//     } catch (error) {
//         console.error("Database query error:", error);
//         throw new Error("Failed to get total billing history count");
//     }
// };






// wokring







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

        let dateCondition = '';
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

        const structuredLogs = walletLogsRows.map(log => {
            const foodDiscountPrice = log.food_discount_price !== null ? log.food_discount_price : log.food_price;
           
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
                    foodDescription: log.food_description ? log.food_description.replace(/<\/?[^>]+(>|$)/g, "") : null,
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
    endDate?: string
): Promise<number> => {

    let countSql = `
        SELECT COUNT(*) AS totalCount
        FROM wallet_logs wl
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
    const [rows]: [RowDataPacket[], any] = await db.promise().query(countSql, queryParams);
    
    return rows[0].totalCount; 
};




//for mobile


export const getOrdersBillingForMobile = async (
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

        let dateCondition = '';
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
                ol.product_id,
                f.name AS food_name,
                f.price AS food_price,
                COUNT(ol.product_id) AS food_quantity  -- Calculate quantity
            FROM wallet_logs wl 
            LEFT JOIN orders o ON wl.order_id = o.id
            LEFT JOIN order_logs ol ON o.id = ol.order_id
            LEFT JOIN foods f ON ol.product_id = f.id
            WHERE wl.user_id = ? 
            ${dateCondition}
            GROUP BY wl.id, ol.product_id  -- Group by log id and food product id
            ORDER BY wl.created_at DESC 
            LIMIT ? OFFSET ?; 
        `;

        queryParams.push(limit, offset);

        const [walletLogsRows]: [RowDataPacket[], any] = await db
            .promise()
            .query(walletLogsSql, queryParams);

        // Structure wallet logs and food data
        const structuredLogs = [];
        const foodMap = new Map(); // Use a Map to collect food data

        for (const log of walletLogsRows) {
            structuredLogs.push({
                logId: log.log_id,
                orderId: log.order_id,
                orderDate: log.wallet_log_order_date,
                beforeBalance: log.before_balance,
                amount: log.amount,
                afterBalance: log.after_balance,
                walletType: log.wallet_type,
                description: log.description,
                createdAt: log.log_created_at,
            });

            // Collect food data
            const foodEntry = {
                foodId: log.product_id,
                foodName: log.food_name,
                foodPrice: log.food_price,
                quantity: log.food_quantity,
            };

            if (foodMap.has(foodEntry.foodId)) {
                const existing = foodMap.get(foodEntry.foodId);
                existing.quantity += foodEntry.quantity; // Aggregate quantity
            } else {
                foodMap.set(foodEntry.foodId, foodEntry);
            }
        }

        // Convert food map to array
        const foods = Array.from(foodMap.values());

        const billingInfo = {
            currentBalance,
            walletLogs: structuredLogs,
            foods, // Add foods array to billing info
        };

        return billingInfo;
    } catch (error) {
        console.error("SQL Error in getOrdersBilling:", error);
        throw new Error("Failed to retrieve orders billing information.");
    }
};