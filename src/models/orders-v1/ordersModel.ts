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
export const getAllOrders = async (
  userId: number,
  page: number,
  limit: number,
  startDate?: Date,
  endDate?: Date
): Promise<{ total: number; orders: any[] }> => {
  const offset = (page - 1) * limit;

  // Query to count total orders
  const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    INNER JOIN order_logs ol ON o.id = ol.order_id
    WHERE ol.user_id = ?
    ${startDate ? 'AND o.order_date >= ?' : ''}
    ${endDate ? 'AND o.order_date <= ?' : ''}
  `;

  const countParams: (number | string)[] = [userId];
  if (startDate) countParams.push(startDate.toISOString().slice(0, 19).replace('T', ' '));
  if (endDate) countParams.push(endDate.toISOString().slice(0, 19).replace('T', ' '));

  const [countRows]: [RowDataPacket[], any] = await db.promise().query(countQuery, countParams);
  const total = countRows[0].total; // Get total orders

  // Query to fetch paginated orders
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
    ${startDate ? 'AND o.order_date >= ?' : ''}
    ${endDate ? 'AND o.order_date <= ?' : ''}
    ORDER BY 
      o.order_date DESC
    LIMIT ?, ?;
  `;

  const queryParams: (number | string)[] = [userId];
  if (startDate) queryParams.push(startDate.toISOString().slice(0, 19).replace('T', ' '));
  if (endDate) queryParams.push(endDate.toISOString().slice(0, 19).replace('T', ' '));
  queryParams.push(offset, limit);

  const [rows]: [RowDataPacket[], any] = await db.promise().query(query, queryParams);

  const orders = []; // Process the rows
  rows.forEach(row => {
    let order = orders.find(o => o.order_id === row.order_id);
    if (!order) {
      order = {
        order_id: row.order_id,
        user_id: row.user_id,
        order_date: row.order_date,
        created_at: row.order_created_at, 
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
        updated_at: row.order_updated_at,
        status: row.order_status,
        order_logs: [],
        order_combos: [],
        food_items: [],
      };
      orders.push(order);
    }

    // Add order logs
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

    // Add order combos
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

    // Add food items
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
