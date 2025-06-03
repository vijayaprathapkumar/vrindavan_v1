"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoodOrderSummary = exports.getAllFoodOrders = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllFoodOrders = async (page, limit, routeId, productId, startDate, endDate, searchTerm) => {
    const offset = (page - 1) * limit;
    let conditions = "WHERE 1=1";
    const queryParams = [];
    if (routeId) {
        conditions += " AND tr.id = ?";
        queryParams.push(routeId);
    }
    if (productId) {
        conditions += " AND f.id = ?";
        queryParams.push(productId);
    }
    const formatDate = (date) => date.toISOString().split("T")[0];
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
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(dataQuery, [...queryParams, limit, offset]);
    const [[{ total }]] = await databaseConnection_1.db
        .promise()
        .query(countQuery, queryParams);
    return { foodOrders: rows, total };
};
exports.getAllFoodOrders = getAllFoodOrders;
const getFoodOrderSummary = async (page, limit, routeId, productId, startDate, endDate, searchTerm) => {
    let conditions = "WHERE 1=1";
    const queryParams = [];
    if (routeId) {
        conditions += " AND tr.id = ?";
        queryParams.push(routeId);
    }
    if (productId) {
        conditions += " AND f.id = ?";
        queryParams.push(productId);
    }
    const formatDate = (date) => date.toISOString().split("T")[0];
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
       ORDER BY product_type_weightage ASC  
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
    const [[summaryRows], [[{ total }]]] = await Promise.all([
        databaseConnection_1.db
            .promise()
            .query(summaryQuery, [...queryParams, limit, offset]),
        databaseConnection_1.db.promise().query(countQuery, queryParams),
    ]);
    return { summaryData: summaryRows, total };
};
exports.getFoodOrderSummary = getFoodOrderSummary;
