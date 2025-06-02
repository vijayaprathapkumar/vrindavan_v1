import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

export const getDeliveryBoyOrders = async (
  page: number,
  limit: number,
  deliveryBoyId?: string | number | null,
  startDate?: Date | null,
  endDate?: Date | null,
  searchTerm?: string | null,
  productId?: number | null
): Promise<{ orders: RowDataPacket[]; total: number }> => {
  const offset = (page - 1) * limit;
  let conditions = "WHERE o.delivery_boy_id IS NOT NULL";
  const queryParams: (string | number)[] = [];

  if (deliveryBoyId !== null && deliveryBoyId !== "All") {
    const parsedDeliveryBoyId = Number(deliveryBoyId);
    if (!isNaN(parsedDeliveryBoyId)) {
      conditions += " AND o.delivery_boy_id = ?";
      queryParams.push(parsedDeliveryBoyId);
    }
  }

  if (productId) {
    conditions += " AND f.id = ?";
    queryParams.push(productId);
  }

  if (startDate && endDate) {
    conditions += " AND DATE(o.order_date) BETWEEN ? AND ?";
    queryParams.push(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );
  }

  if (searchTerm) {
    conditions += `
      AND (
        u.name LIKE ? OR 
        u.phone LIKE ? OR 
        f.name LIKE ? OR 
        da.house_no LIKE ? OR 
        l.name LIKE ?
      )`;
    const term = `%${searchTerm}%`;
    queryParams.push(term, term, term, term, term);
  }

  const ordersQuery = `
    SELECT 
      u.name AS customer_name,
      u.phone AS mobile,
      da.house_no AS flat,
      da.address AS address,
      da.complete_address AS complete_address,
      f.name AS product_name,
      f.unit AS unit_size,
      fo.quantity,
      CASE 
        WHEN f.discount_price IS NOT NULL AND f.discount_price > 0 
        THEN f.discount_price 
        ELSE f.price 
      END AS unit_price,
      fo.quantity * 
      CASE 
        WHEN f.discount_price IS NOT NULL AND f.discount_price > 0 
        THEN f.discount_price 
        ELSE f.price 
      END AS amount,
      l.name AS locality_name,
      l.city AS locality_city,
      o.order_date
    FROM food_orders fo
    JOIN orders o ON fo.order_id = o.id
    JOIN users u ON o.user_id = u.id
    LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
    JOIN foods f ON fo.food_id = f.id
    LEFT JOIN localities l ON o.locality_id = l.id
    ${conditions}
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM food_orders fo
    JOIN orders o ON fo.order_id = o.id
    JOIN users u ON o.user_id = u.id
    LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
    JOIN foods f ON fo.food_id = f.id
    LEFT JOIN localities l ON o.locality_id = l.id
    ${conditions}
  `;

  try {
    const [orders] = await db
      .promise()
      .query<RowDataPacket[]>(ordersQuery, [...queryParams, limit, offset]);

    const [[{ total }]] = await db
      .promise()
      .query<RowDataPacket[]>(countQuery, queryParams);

    return { orders, total };
  } catch (error) {
    console.error("Database error in getDeliveryBoyOrders:", error);
    throw error;
  }
};
export const getDeliveryBoyOrderSummary = async (
  page: number,
  limit: number,
  deliveryBoyId?: string | number | null,
  startDate?: Date | null,
  endDate?: Date | null,
  searchTerm?: string | null
): Promise<{ summary: RowDataPacket[]; total: number }> => {
  const offset = (page - 1) * limit;
  let conditions = "WHERE o.delivery_boy_id IS NOT NULL";
  const queryParams: (string | number)[] = [];

  if (deliveryBoyId !== null && deliveryBoyId !== "All") {
    const parsedDeliveryBoyId = Number(deliveryBoyId);
    if (!isNaN(parsedDeliveryBoyId)) {
      conditions += " AND o.delivery_boy_id = ?";
      queryParams.push(parsedDeliveryBoyId);
    }
  }

  if (startDate && endDate) {
    conditions += " AND DATE(o.order_date) BETWEEN ? AND ?";
    queryParams.push(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );
  }

  if (searchTerm) {
    conditions += `
      AND (
        f.name LIKE ? OR 
        u.name LIKE ? OR 
        u.phone LIKE ?
      )`;
    const term = `%${searchTerm}%`;
    queryParams.push(term, term, term);
  }

  const summaryQuery = `
  SELECT
      f.id AS food_id,
      f.name AS product_name,
      f.unit AS unit_size,
      f.product_type_id,
      pt.name AS product_type_name,
      pt.weightage AS product_type_weightage,
      SUM(fo.quantity) AS total_quantity,
      f.weightage AS product_weightage,
      f.price AS unit_price,
      f.discount_price,
      SUM(
        fo.quantity * 
        CASE 
          WHEN f.discount_price IS NOT NULL AND f.discount_price > 0 
          THEN f.discount_price 
          ELSE f.price 
        END
      ) AS total_amount
    FROM food_orders fo
    JOIN orders o ON fo.order_id = o.id
    JOIN foods f ON fo.food_id = f.id
    JOIN hubs h ON o.hub_id = h.id
    JOIN truck_routes tr ON h.route_id = tr.id
    LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.user_id
    LEFT JOIN product_types pt ON f.product_type_id = pt.id
    ${conditions}
    GROUP BY 
      f.id, f.name, f.unit, f.product_type_id, 
      pt.name, pt.weightage,
      f.weightage, f.price, f.discount_price
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT f.id) AS total
    FROM food_orders fo
    JOIN orders o ON fo.order_id = o.id
    JOIN foods f ON fo.food_id = f.id
    JOIN hubs h ON o.hub_id = h.id
    JOIN truck_routes tr ON h.route_id = tr.id
    LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.user_id
    LEFT JOIN product_types pt ON f.product_type_id = pt.id
    ${conditions}
  `;

  const [summary] = await db
    .promise()
    .query<RowDataPacket[]>(summaryQuery, [...queryParams, limit, offset]);
  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(countQuery, queryParams);

  return { summary, total };
};
