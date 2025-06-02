import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

const formatDate = (date: Date) => date.toISOString().split("T")[0];
export const getAllHubOrders = async (
  page: number,
  limit: number,
  routeId?: number | null,
  productId?: number | null,
  startDate?: Date | null,
  endDate?: Date | null,
  searchTerm?: string | null,
  hubId?: number | null
): Promise<{ hubOrders: RowDataPacket[]; total: number }> => {
  const offset = (page - 1) * limit;
  let conditions = "WHERE 1=1";
  const queryParams: (string | number)[] = [];

  if (routeId) {
    conditions += " AND tr.id = ?";
    queryParams.push(routeId);
  }

  if (hubId) {
    conditions += " AND o.hub_id = ?";
    queryParams.push(hubId);
  }

  if (productId) {
    conditions += " AND f.id = ?";
    queryParams.push(productId);
  }

  if (startDate && endDate) {
    conditions += " AND DATE(o.order_date) BETWEEN ? AND ?";
    queryParams.push(formatDate(startDate), formatDate(endDate));
  }

  if (searchTerm) {
    conditions +=
      " AND (f.name LIKE ? OR h.name LIKE ? OR db.name LIKE ? OR pt.name LIKE ?)";
    const term = `%${searchTerm}%`;
    queryParams.push(term, term, term, term);
  }

  // Main query with grouped data including delivery_boy_id
  const dataQuery = `
    SELECT
      tr.id AS route_id,
      tr.name AS route,
      h.id AS hub_id,
      h.name AS hub,
      f.id AS food_id,
      f.name AS product_name,
      f.unit AS unit_size,
      f.product_type_id,
      pt.name AS product_type_name,
      pt.weightage AS product_type_weightage,
      o.delivery_boy_id,
      COALESCE(db.name, 'Unassigned') AS delivery_boy_name,
      SUM(fo.quantity) AS total_quantity,
      f.weightage AS product_weightage,
      f.price AS unit_price,
      f.discount_price,
      (
        SUM(fo.quantity) * 
        CASE 
          WHEN f.discount_price IS NOT NULL AND f.discount_price > 0 
          THEN f.discount_price 
          ELSE f.price 
        END
      ) AS total_amount,
       o.order_date,
      MAX(o.id) AS latest_order_id
    FROM food_orders fo
    JOIN orders o ON fo.order_id = o.id
    JOIN foods f ON fo.food_id = f.id
    JOIN hubs h ON o.hub_id = h.id
    JOIN truck_routes tr ON h.route_id = tr.id
    LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.user_id
    LEFT JOIN product_types pt ON f.product_type_id = pt.id
    ${conditions}
    GROUP BY 
      tr.id, tr.name, 
      h.id, h.name, 
      f.id, f.name, f.unit, f.product_type_id, f.weightage, f.price, f.discount_price,
      o.delivery_boy_id, db.name,  o.order_date,
      pt.name, pt.weightage
    ORDER BY latest_order_id DESC
    LIMIT ? OFFSET ?
  `;

  // Count query for ALL individual food orders (not grouped)
  const countQuery = `
    SELECT COUNT(*) AS total FROM (
      SELECT 1
      FROM food_orders fo
      JOIN orders o ON fo.order_id = o.id
      JOIN foods f ON fo.food_id = f.id
      JOIN hubs h ON o.hub_id = h.id
      JOIN truck_routes tr ON h.route_id = tr.id
      LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.user_id
      LEFT JOIN product_types pt ON f.product_type_id = pt.id
      ${conditions}
      GROUP BY 
        tr.id, tr.name, 
        h.id, h.name, 
        f.id, f.name, f.unit, f.product_type_id, f.weightage, f.price, f.discount_price,
        o.delivery_boy_id, db.name,  o.order_date,
        pt.name, pt.weightage
    ) AS grouped
  `;

  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(dataQuery, [...queryParams, limit, offset]);
  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(countQuery, queryParams);

  return { hubOrders: rows, total };
};
export const getHubOrderSummary = async (
  page: number,
  limit: number,
  routeId?: number | null,
  productId?: number | null,
  startDate?: Date | null,
  endDate?: Date | null,
  searchTerm?: string | null
): Promise<{ summaryData: RowDataPacket[]; total: number }> => {
  const offset = (page - 1) * limit;
  let conditions = "WHERE 1=1";
  const queryParams: (string | number)[] = [];

  if (routeId) {
    conditions += " AND tr.id = ?";
    queryParams.push(routeId);
  }

  if (productId) {
    conditions += " AND f.id = ?";
    queryParams.push(productId);
  }

  if (startDate && endDate) {
    conditions += " AND DATE(o.order_date) BETWEEN ? AND ?";
    queryParams.push(formatDate(startDate), formatDate(endDate));
  }

  if (searchTerm) {
    conditions +=
      " AND (f.name LIKE ? OR h.name LIKE ? OR db.name LIKE ? OR pt.name LIKE ?)";
    const term = `%${searchTerm}%`;
    queryParams.push(term, term, term, term);
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

  const [summaryRows] = await db
    .promise()
    .query<RowDataPacket[]>(summaryQuery, [...queryParams, limit, offset]);
  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(countQuery, queryParams);

  return { summaryData: summaryRows, total };
};
