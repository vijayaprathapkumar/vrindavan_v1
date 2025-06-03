"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllHubOrders = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllHubOrders = async (limit, offset, searchTerm, routeNameFilter, foodNameFilter, startDate, endDate) => {
    try {
        let whereClauses = [];
        let queryParams = [limit, offset];
        // Search term filter (route_name, hub_name, food_unit)
        if (searchTerm) {
            whereClauses.push(`(r1.name LIKE ? OR h.name LIKE ? OR f.unit LIKE ?)`);
            queryParams.unshift(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        // Route name filter
        if (routeNameFilter) {
            whereClauses.push(`r1.name = ?`);
            queryParams.unshift(routeNameFilter);
        }
        // Food name filter
        if (foodNameFilter) {
            whereClauses.push(`f.name = ?`);
            queryParams.unshift(foodNameFilter);
        }
        // Date filter
        if (startDate && endDate) {
            whereClauses.push(`o.created_at BETWEEN ? AND ?`);
            queryParams.unshift(startDate, endDate);
        }
        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        // Query to fetch paginated data
        const [rows] = await databaseConnection_1.db.promise().query(`
      SELECT
        r1.id AS route_id,
        r1.name AS route_name,
        h.id AS hub_id,
        h.name AS hub_name,
        db.id AS delivery_boy_id,
        db.name AS delivery_boy_name,
        f.id AS food_id,
        f.name AS food_name,
        f.unit AS food_unit,
        fo.quantity AS food_quantity,
        fo.price AS food_price,  
        f.weightage AS food_weightage,
        pt.id AS product_type_id,
        pt.name AS product_type_name,
        pt.weightage AS product_type_weightage,
        o.created_at AS order_created_at,
        o.updated_at AS order_updated_at
      FROM orders o
      LEFT JOIN truck_routes r1 ON o.route_id = r1.id
      LEFT JOIN hubs h ON o.hub_id = h.id
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      LEFT JOIN product_types pt ON f.product_type_id = pt.id
      LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.id
      ${whereClause}
      ORDER BY o.id, f.id
      LIMIT ? OFFSET ?
    `, queryParams);
        // Query to get the total count of records (without pagination)
        const [countResult] = await databaseConnection_1.db.promise().query(`
      SELECT COUNT(*) as totalRecords
      FROM orders o
      LEFT JOIN truck_routes r1 ON o.route_id = r1.id
      LEFT JOIN hubs h ON o.hub_id = h.id
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      LEFT JOIN product_types pt ON f.product_type_id = pt.id
      LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.id
      ${whereClause}
    `, queryParams.slice(0, queryParams.length - 2));
        const totalRecords = countResult[0].totalRecords;
        const structuredData = rows.map((row) => ({
            Route: row.route_name,
            Hub: row.hub_name,
            "Product Name": row.food_name,
            "Unit Size": row.food_unit,
            Quantity: row.food_quantity,
            Price: row.food_price,
            "Food Weightage": row.food_weightage,
            "Product Type": {
                id: row.product_type_id,
                name: row.product_type_name,
                weightage: row.product_type_weightage
            },
            "Delivery Boy": {
                id: row.delivery_boy_id,
                name: row.delivery_boy_name
            },
            "Order Created At": row.order_created_at,
            "Order Updated At": row.order_updated_at
        }));
        return { totalRecords, orders: structuredData };
    }
    catch (error) {
        console.error("Error fetching hub orders:", error);
        throw error;
    }
};
exports.getAllHubOrders = getAllHubOrders;
