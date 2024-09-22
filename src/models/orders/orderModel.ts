import { db } from "../../config/databaseConnection"; // Ensure this file is set up correctly
import { RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";

// Fetch all orders with relational data
export const getAllOrders = async (): Promise<{ data: any[] }> => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
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
        o.created_at,
        o.updated_at,
        r1.name AS route_name,
        h.id AS hub_id,
        h.name AS hub_name,
        h.other_details AS hub_other_details,
        h.active AS hub_active,
        h.created_at AS hub_created_at,
        h.updated_at AS hub_updated_at,
        l.city AS locality_name,
        d.name AS delivery_boy_name,
        s.status AS order_status,
        da.address AS delivery_address,
        da.complete_address AS complete_address,
        da.latitude,
        da.longitude,
        da.house_no,
        da.is_approve,
        da.is_default,
        p.price AS payment_amount,
        p.method AS payment_method,
        p.description AS payment_description,
        p.method AS payment_method,
        p.user_id AS payment_user_id,
        p.status AS payment_status,
        p.created_at AS payment_created_at,
        p.updated_at AS payments_updated_at,
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
        f.food_locality AS food_food_locality,
        fo.quantity AS food_quantity,
        r2.id AS restaurant_id,
        r2.name AS restaurant_name,
        r2.description AS restaurant_description,
        r2.address AS restaurant_address,
        r2.latitude AS restaurant_latitude,
        r2.longitude AS restaurant_longitude,
        r2.phone AS restaurant_phone,
        r2.mobile AS restaurant_mobile,
        r2.information AS restaurant_information,
        r2.admin_commission AS restaurant_admin_commission,
        r2.delivery_fee AS restaurant_delivery_fee,
        r2.delivery_range AS restaurant_delivery_range,
        r2.default_tax AS restaurant_default_tax,
        r2.closed AS restaurant_closed,
        r2.active AS restaurant_active,
        r2.available_for_delivery AS restaurant_available_for_delivery,
        r2.created_at AS restaurant_created_at,
        r2.updated_at AS restaurant_updated_at
      FROM orders o
      LEFT JOIN truck_routes r1 ON o.route_id = r1.id
      LEFT JOIN hubs h ON o.hub_id = h.id
      LEFT JOIN localities l ON o.locality_id = l.id
      LEFT JOIN delivery_boys d ON o.delivery_boy_id = d.id
      LEFT JOIN order_statuses s ON o.order_status_id = s.id
      LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
      LEFT JOIN payments p ON o.payment_id = p.id
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      LEFT JOIN restaurants r2 ON f.restaurant_id = r2.id
    `);

    const orders = rows.reduce((acc: any[], row: any) => {
      let existingOrder = acc.find((order) => order.order_id === row.order_id);

      if (!existingOrder) {
        existingOrder = {
          id: row.order_id,
          user_id: row.user_id,
          order_type: row.order_type,
          order_date: row.order_date,
          route: {
            id: row.route_id,
            name: row.route_name,
          },
          hub: {
            id: row.hub_id,
            name: row.hub_name,
            other_details: row.hub_other_details,
            active: row.hub_active,
            created_at: row.hub_created_at,
            updated_at: row.hub_updated_at,
          },
          locality: {
            id: row.locality_id,
            name: row.locality_name,
          },
          delivery_boy: {
            id: row.delivery_boy_id,
            name: row.delivery_boy_name,
          },
          order_status: row.order_status,
          delivery_address: {
            id: row.delivery_address_id,
            address: row.delivery_address,
            complete_address: row.complete_address,
            latitude: row.latitude,
            longitude: row.longitude,
            house_no: row.house_no,
            is_approve: row.is_approve,
            is_default: row.is_default,
          },
          payment: {
            id: row.payment_id,
            amount: row.payment_amount,
            method: row.payment_method,
            description: row.payment_description,
            user_id: row.payment_user_id,
            status: row.payment_status,
            created_at: row.payment_created_at,
            updated_at: row.payments_updated_at,
          },
          foods: [],
        };

        acc.push(existingOrder);
      }

      if (row.food_id) {
        existingOrder.foods.push({
          id: row.food_id,
          name: row.food_name,
          price: row.food_price,
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
          restaurant: {
            id: row.restaurant_id,
            name: row.restaurant_name,
            description: row.restaurant_description,
            address: row.restaurant_address,
            latitude: row.restaurant_latitude,
            longitude: row.restaurant_longitude,
            phone: row.restaurant_phone,
            mobile: row.restaurant_mobile,
            information: row.restaurant_information,
            admin_commission: row.restaurant_admin_commission,
            delivery_fee: row.restaurant_delivery_fee,
            delivery_range: row.restaurant_delivery_range,
            default_tax: row.restaurant_default_tax,
            closed: row.restaurant_closed,
            active: row.restaurant_active,
            available_for_delivery: row.restaurant_available_for_delivery,
            created_at: row.restaurant_created_at,
            updated_at: row.restaurant_updated_at,
          },
          quantity: row.food_quantity,
        });
      }

      return acc;
    }, []);

    return { data: orders }; // Return object with `data`
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};


// Fetch order by ID with relational data
export const getOrderById = async (id: number): Promise<any> => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(
      `
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
        o.created_at,
        o.updated_at,
        r1.name AS route_name,
        h.name AS hub_name,
        l.city AS locality_name,
        d.name AS delivery_boy_name,
        s.status AS order_status,
        da.address AS delivery_address,
        da.complete_address AS complete_address,
        da.latitude,
        da.longitude,
        da.house_no,
        da.is_approve,
        da.is_default,
        p.price AS payment_amount,
        p.method AS payment_method,
        p.description AS payment_description,



        p.method AS payment_method,
        p.user_id AS payment_user_id,
        p.status AS payment_status,
        p.created_at AS payment_created_at,
        p.updated_at AS payments_updated_at,

        

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
        f.food_locality AS food_food_locality,
        fo.quantity AS food_quantity,
        r2.id AS restaurant_id,
        r2.name AS restaurant_name,
        r2.description AS restaurant_description,
        r2.address AS restaurant_address,
        r2.latitude AS restaurant_latitude,
        r2.longitude AS restaurant_longitude,
        r2.phone AS restaurant_phone,
        r2.mobile AS restaurant_mobile,
        r2.information AS restaurant_information,
        r2.admin_commission AS restaurant_admin_commission,
        r2.delivery_fee AS restaurant_delivery_fee,
        r2.delivery_range AS restaurant_delivery_range,
        r2.default_tax AS restaurant_default_tax,
        r2.closed AS restaurant_closed,
        r2.active AS restaurant_active,
        r2.available_for_delivery AS restaurant_available_for_delivery,
        r2.created_at AS restaurant_created_at,
        r2.updated_at AS restaurant_updated_at
      FROM orders o
      LEFT JOIN truck_routes r1 ON o.route_id = r1.id
      LEFT JOIN hubs h ON o.hub_id = h.id
      LEFT JOIN localities l ON o.locality_id = l.id
      LEFT JOIN delivery_boys d ON o.delivery_boy_id = d.id
      LEFT JOIN order_statuses s ON o.order_status_id = s.id
      LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
      LEFT JOIN payments p ON o.payment_id = p.id
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      LEFT JOIN restaurants r2 ON f.restaurant_id = r2.id
      WHERE o.id = ?
    `,
      [id]
    );

    if (rows.length === 0) return null;

    const order = rows.reduce((acc: any, row: any) => {
      if (!acc) {
        acc = {
          id: row.order_id,
          user_id: row.user_id,
          order_type: row.order_type,
          order_date: row.order_date,
          route: {
            id: row.route_id,
            name: row.route_name,
          },
          hub: {
            name: row.hub_name,
          },
          locality: {
            name: row.locality_name,
          },
          delivery_boy: {
            name: row.delivery_boy_name,
          },
          order_status: row.order_status,
          delivery_address: {
            id: row.delivery_address_id,
            address: row.delivery_address,
            complete_address: row.complete_address,
            latitude: row.latitude,
            longitude: row.longitude,
            house_no: row.house_no,
            is_approve: row.is_approve,
            is_default: row.is_default,
          },
          payment: {
            id: row.payment_id,
            amount: row.payment_amount,
            method: row.payment_method,
            description: row.payment_description,
            user_id: row.payment_user_id,
            status: row.payment_status,
            created_at: row.payment_created_at,
            updated_at: row.payments_updated_at,
          },
          foods: [],
        };
      }

      if (row.food_id) {
        acc.foods.push({
          id: row.food_id,
          name: row.food_name,
          price: row.food_price,
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
          restaurant: {
            id: row.restaurant_id,
            name: row.restaurant_name,
            description: row.restaurant_description,
            address: row.restaurant_address,
            latitude: row.restaurant_latitude,
            longitude: row.restaurant_longitude,
            phone: row.restaurant_phone,
            mobile: row.restaurant_mobile,
            information: row.restaurant_information,
            admin_commission: row.restaurant_admin_commission,
            delivery_fee: row.restaurant_delivery_fee,
            delivery_range: row.restaurant_delivery_range,
            default_tax: row.restaurant_default_tax,
            closed: row.restaurant_closed,
            active: row.restaurant_active,
            available_for_delivery: row.restaurant_available_for_delivery,
            created_at: row.restaurant_created_at,
            updated_at: row.restaurant_updated_at,
          },
          quantity: row.food_quantity,
        });
      }

      return acc;
    }, null);

    return order;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw error;
  }
};

// Create a new order
export const createOrderInDb = async (orderData: any): Promise<any> => {
  try {
    const [result] = await db.promise().query(
      `
      INSERT INTO orders (
        user_id, order_type, order_date, route_id, hub_id, locality_id,
        delivery_boy_id, order_status_id, tax, delivery_fee, hint, active,
        driver_id, delivery_address_id, payment_id, is_wallet_deduct,
        delivery_status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
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
      ]
    );

    const insertId = (result as mysql.ResultSetHeader).insertId;

    return insertId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Update an existing order
export const updateOrderInDb = async (
  id: number,
  orderData: any
): Promise<any> => {
  try {
    const [result] = await db.promise().query(
      `
      UPDATE orders SET
        user_id = ?, order_type = ?, order_date = ?, route_id = ?, hub_id = ?, locality_id = ?,
        delivery_boy_id = ?, order_status_id = ?, tax = ?, delivery_fee = ?, hint = ?, active = ?,
        driver_id = ?, delivery_address_id = ?, payment_id = ?, is_wallet_deduct = ?,
        delivery_status = ?, updated_at = NOW()
      WHERE id = ?
    `,
      [
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
      ]
    );

    return result;
  } catch (error) {
    console.error("Error updating order:", error);
    throw error;
  }
};

// Delete an order by ID
export const deleteOrderInDb = async (id: number): Promise<any> => {
  try {
    const [result] = await db.promise().query(
      `
      DELETE FROM orders WHERE id = ?
    `,
      [id]
    );

    return result;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};
