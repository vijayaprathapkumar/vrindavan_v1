import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

export const getAllFoodOrders = async (
  page: number,
  limit: number,
  routeId?: number | null,
  productId?: number | null,
  startDate?: Date | null,
  endDate?: Date | null,
  searchTerm?: string | null
): Promise<{ foodOrders: RowDataPacket[]; total: number }> => {
  const offset = (page - 1) * limit;

  let conditions = "WHERE 1=1";
  const queryParams: (string | number | Date)[] = [];

  if (routeId) {
    conditions += " AND tr.id = ?";
    queryParams.push(routeId);
  }

  if (productId) {
    conditions += " AND f.id = ?";
    queryParams.push(productId);
  }

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  if (startDate && endDate) {
    conditions += " AND DATE(o.order_date) BETWEEN ? AND ?";
    queryParams.push(formatDate(startDate), formatDate(endDate));
  }

  if (searchTerm) {
    conditions += " AND (f.name LIKE ? OR h.name LIKE ?)";
    queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  const dataQuery = `
  SELECT 
    tr.name AS route,
    h.name AS hub,
    f.name AS product_name,
    f.unit AS unit_size,
    SUM(fo.quantity) AS total_quantity,
    MAX(o.order_date) AS order_date,
    f.price AS unit_price,
    f.discount_price,
    (
      SUM(fo.quantity) * 
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
  ${conditions}
  GROUP BY tr.name, h.name, f.name, f.unit,f.price, f.discount_price
  LIMIT ? OFFSET ?
`;

  const countQuery = `
    SELECT COUNT(*) AS total FROM (
      SELECT 1
      FROM food_orders fo
      JOIN orders o ON fo.order_id = o.id
      JOIN foods f ON fo.food_id = f.id
      JOIN hubs h ON o.hub_id = h.id
      JOIN truck_routes tr ON h.route_id = tr.id
      ${conditions}
      GROUP BY tr.name, h.name, f.name, f.unit
    ) AS grouped
  `;

  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>(dataQuery, [...queryParams, limit, offset]);

  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(countQuery, queryParams);

  return { foodOrders: rows, total };
};
export const getFoodOrderSummary = async (
  page: number,
  limit: number,
  routeId?: number | null,
  productId?: number | null,
  startDate?: Date | null,
  endDate?: Date | null,
  searchTerm?: string | null
): Promise<{ summaryData: RowDataPacket[]; total: number }> => {
  let conditions = "WHERE 1=1";
  const queryParams: (string | number | Date)[] = [];

  if (routeId) {
    conditions += " AND tr.id = ?";
    queryParams.push(routeId);
  }

  if (productId) {
    conditions += " AND f.id = ?";
    queryParams.push(productId);
  }

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  if (startDate && endDate) {
    conditions += " AND DATE(o.order_date) BETWEEN ? AND ?";
    queryParams.push(formatDate(startDate), formatDate(endDate));
  }

  if (searchTerm) {
    conditions += " AND (f.name LIKE ? OR h.name LIKE ?)";
    queryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
  }

  const offset = (page - 1) * limit;

  const summaryQuery = `
    SELECT 
      f.id AS food_id,
      f.name AS product_name,
      f.unit AS unit_size,
      SUM(fo.quantity) AS total_quantity,
      pt.weightage AS product_type_weightage,
       f.price AS unit_price,
    f.discount_price,
    (
      SUM(fo.quantity) * 
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
    JOIN product_types pt ON f.product_type_id = pt.id
    ${conditions}
    GROUP BY f.id, f.name, f.unit, pt.weightage, f.price, f.discount_price
    ORDER BY total_quantity DESC
    LIMIT ? OFFSET ?
  `;

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

  const [[summaryRows], [[{ total }]]] = await Promise.all([
    db
      .promise()
      .query<RowDataPacket[]>(summaryQuery, [...queryParams, limit, offset]),
    db.promise().query<RowDataPacket[]>(countQuery, queryParams),
  ]);

  return { summaryData: summaryRows, total };
};
