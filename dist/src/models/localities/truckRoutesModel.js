"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTruckRouteById = exports.updateTruckRouteById = exports.getTruckRouteById = exports.createTruckRoute = exports.getAllTruckRoutes = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all truck routes, ordered by created_at
const getAllTruckRoutes = async (page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    const routesQuery = `
      SELECT * FROM truck_routes 
      WHERE name LIKE ? 
      ORDER BY COALESCE(updated_at, created_at) DESC 
      LIMIT ? OFFSET ?
  `;
    const [routes] = await databaseConnection_1.db.promise().query(routesQuery, [`%${searchTerm}%`, limit, offset]);
    const countQuery = `
      SELECT COUNT(*) as total FROM truck_routes 
      WHERE name LIKE ?
  `;
    const [[{ total }]] = await databaseConnection_1.db.promise().query(countQuery, [`%${searchTerm}%`]);
    return { routes, totalRecords: total };
};
exports.getAllTruckRoutes = getAllTruckRoutes;
// Create a new truck route
const createTruckRoute = async (name, active) => {
    await databaseConnection_1.db.promise().query("INSERT INTO truck_routes (name, active, created_at, updated_at) VALUES (?, ?, NOW(), NOW())", [name, active]);
};
exports.createTruckRoute = createTruckRoute;
// Fetch truck route by ID
const getTruckRouteById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM truck_routes WHERE id = ?", [id]);
    return rows;
};
exports.getTruckRouteById = getTruckRouteById;
// Update truck route by ID
const updateTruckRouteById = async (id, name, active) => {
    await databaseConnection_1.db.promise().query("UPDATE truck_routes SET name = ?, active = ?, updated_at = NOW() WHERE id = ?", [name, active, id]);
};
exports.updateTruckRouteById = updateTruckRouteById;
// Delete truck route by ID
const deleteTruckRouteById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM truck_routes WHERE id = ?", [id]);
};
exports.deleteTruckRouteById = deleteTruckRouteById;
