import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

// Define interfaces for each data type
interface FoodData {
    id: number; // This is the product_id
    name: string;
    price: number;
    discount_price: number | null;
    description: string;
    perma_link: string;
    ingredients: string | null;
    package_items_count: number;
    weight: number;
    unit: string;
    sku_code: string;
    barcode: string | null;
    cgst: string | null;
    sgst: string | null;
    subscription_type: string;
    track_inventory: string;
    featured: number;
    deliverable: number;
    restaurant_id: number;
    category_id: number;
    subcategory_id: number;
    product_type_id: number;
    hub_id: number | null;
    locality_id: number | null;
    product_brand_id: number;
    weightage: number;
    status: string;
    created_at: Date;
    updated_at: Date;
    food_locality: number;
}

interface OrderCombo {
    id: number;
    price: string;
    quantity: number;
    combo_id: number;
    order_id: number;
    created_at: Date;
    updated_at: Date;
}

interface OrderComboDetail {
    id: number;
    order_combo_id: number;
    order_id: number;
    product_id: number; // This corresponds to the product_id in foods
    created_at: Date;
    updated_at: Date;
}

interface OrderLog {
    id: number;
    order_date: Date;
    user_id: number;
    order_id: number;
    product_id: number; // Corresponds to the product_id in foods
    locality_id: number | null;
    delivery_boy_id: number;
    is_created: number;
    logs: string;
    created_at: Date;
    updated_at: Date;
}

// The CombinedOrderData interface reflects the new structure
interface CombinedOrderData {
    orders: { 
        order_id: number; 
        user_id: number; 
        order_date: Date; 
        created_at: Date;
        order_type: string;
        route_id: number | null;
        hub_id: number | null;
        locality_id: number | null;
        delivery_boy_id: number | null;
        order_status_id: number | null;
        tax: number | null;
        delivery_fee: number | null;
        hint: string | null;
        active: number | null;
        driver_id: number | null;
        delivery_address_id: number | null;
        payment_id: number | null;
        is_wallet_deduct: number | null;
        delivery_status: number | null;
        updated_at: Date;
        status: string;
        order_logs: OrderLog[];
        order_combos: OrderCombo[];
        food_items: FoodData[];
    }[];
}

// Fetch order details for a user
export const getOrderDetails = async (userId: string, page: number, limit: number): Promise<CombinedOrderData> => {
    const offset = (page - 1) * limit; // Calculate offset for pagination

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
        FROM 
            orders o
        INNER JOIN 
            order_logs ol ON o.id = ol.order_id 
        LEFT JOIN 
            order_combos oc ON o.id = oc.order_id
        LEFT JOIN 
            order_combo_details ocd ON oc.id = ocd.order_combo_id
        LEFT JOIN 
            foods f ON ol.product_id = f.id 
        LEFT JOIN 
            order_statuses os ON o.order_status_id = os.id      
        WHERE 
            ol.user_id = ? 
        ORDER BY 
            o.order_date DESC
        LIMIT ?, ?; 
    `;

    try {
        const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [userId, offset, limit]);

        // Initialize response structure
        const response: CombinedOrderData = {
            orders: [],
        };

        // Populate orders array based on the fetched data
        rows.forEach(row => {
            // Check if the order already exists in the response
            let order = response.orders.find(o => o.order_id === row.order_id);
            if (!order) {
                order = {
                    order_id: row.order_id,
                    user_id: row.user_id,
                    order_date: row.order_date,
                    created_at: row.order_created_at, // Set created_at here
                    order_type: row.order_type,
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
                    updated_at: row.order_updated_at, // Added updated_at
                    status: row.order_status,
                    order_logs: [],
                    order_combos: [],
                    food_items: [],
                };
                response.orders.push(order);
            }

            // Populate order logs array
            order.order_logs.push({
                id: row.order_log_id,
                order_date: row.order_log_date,
                user_id: row.user_id,
                order_id: row.order_id,
                product_id: row.order_log_product_id,
                locality_id: row.order_log_locality_id,
                delivery_boy_id: row.order_log_delivery_boy_id,
                is_created: row.order_log_is_created,
                logs: row.order_log_logs,
                created_at: row.order_log_created_at,
                updated_at: row.order_log_updated_at,
            });

            // Populate order combos array
            if (row.order_combo_id) {
                order.order_combos.push({
                    id: row.order_combo_id,
                    price: row.combo_price,
                    quantity: row.combo_quantity,
                    combo_id: row.combo_id,
                    order_id: row.order_id,
                    created_at: row.combo_created_at,
                    updated_at: row.combo_updated_at,
                });
            }

            // Populate food items array
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
        });

        return response;
    } catch (error) {
        console.error("Database query error:", error);
        throw new Error("Failed to fetch order details: " + error.message);
    }
};

// Fetch total count of billing history for a user
export const getTotalBillingHistoryCount = async (userId: string): Promise<number> => {
    const query = `
        SELECT 
            COUNT(*) as total
        FROM 
            order_logs ol
        WHERE 
            ol.user_id = ?;
    `;

    try {
        const [rows]: [RowDataPacket[], any] = await db.promise().query(query, [userId]);
        return rows[0].total;
    } catch (error) {
        console.error("Database query error:", error);
        throw new Error("Failed to get total billing history count");
    }
};
