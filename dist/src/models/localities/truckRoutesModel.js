"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTruckRouteById = exports.updateTruckRouteById = exports.getTruckRouteById = exports.createTruckRoute = exports.getAllTruckRoutes = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all truck routes, ordered by created_at
const getAllTruckRoutes = async (page, limit, searchTerm, sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    // Define valid sort fields to prevent SQL injection
    const validSortFields = {
        name: "name",
        active: "active",
    };
    // Validate sort field and order
    const validSortOrders = ["asc", "desc"];
    const validatedSortField = validSortFields[sortField] || "created_at";
    const validatedSortOrder = validSortOrders.includes(sortOrder?.toLowerCase() || "")
        ? sortOrder.toLowerCase()
        : "asc";
    let whereClause = "WHERE 1=1";
    const params = [];
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (lowerSearchTerm === "active") {
            whereClause += " AND active = ?";
            params.push(1);
        }
        else if (lowerSearchTerm === "inactive") {
            whereClause += " AND active = ?";
            params.push(0);
        }
        else {
            whereClause += " AND name LIKE ?";
            params.push(`%${searchTerm}%`);
        }
    }
    const routesQuery = `
    SELECT * FROM truck_routes 
    ${whereClause}
    ORDER BY ${validatedSortField} ${validatedSortOrder} 
    LIMIT ? OFFSET ?
  `;
    params.push(limit, offset);
    const [routes] = await databaseConnection_1.db.promise().query(routesQuery, params);
    // Count query for total records
    const countQuery = `
    SELECT COUNT(*) as total FROM truck_routes 
    ${whereClause}
  `;
    const [[{ total }]] = await databaseConnection_1.db.promise().query(countQuery, params.slice(0, -2));
    return { routes, totalRecords: total };
};
exports.getAllTruckRoutes = getAllTruckRoutes;
// Create a new truck route
const createTruckRoute = async (name, active) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO truck_routes (name, active, created_at, updated_at) VALUES (?, ?, NOW(), NOW())", [name, active]);
};
exports.createTruckRoute = createTruckRoute;
// Fetch truck route by ID
const getTruckRouteById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM truck_routes WHERE id = ?", [id]);
    return rows.length > 0 ? rows[0] : null;
};
exports.getTruckRouteById = getTruckRouteById;
// Update truck route by ID
const updateTruckRouteById = async (id, name, active) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE truck_routes SET name = ?, active = ?, updated_at = NOW() WHERE id = ?", [name, active, id]);
};
exports.updateTruckRouteById = updateTruckRouteById;
// Delete truck route by ID
const deleteTruckRouteById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM truck_routes WHERE id = ?", [id]);
};
exports.deleteTruckRouteById = deleteTruckRouteById;
