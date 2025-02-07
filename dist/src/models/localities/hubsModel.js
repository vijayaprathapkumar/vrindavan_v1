"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHubById = exports.updateHubById = exports.getHubById = exports.createHub = exports.getAllHubs = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all hubs
const getAllHubs = async (page, limit, searchTerm, sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    const validSortFields = {
        name: "h.name",
        truckRoute: "t.name",
        other_details: "h.other_details",
        active: "h.active",
    };
    const sortColumn = validSortFields[sortField] || "h.name";
    const validSortOrder = sortOrder?.toLowerCase() === "desc" ? "desc" : "asc";
    let whereClause = `WHERE 1=1`;
    const params = [];
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        if (lowerSearchTerm === "active") {
            whereClause += ` AND h.active = ?`;
            params.push(1);
        }
        else if (lowerSearchTerm === "inactive") {
            whereClause += ` AND h.active = ?`;
            params.push(0);
        }
        else {
            whereClause += ` AND (h.name LIKE ? OR t.name LIKE ? OR h.other_details LIKE ? OR h.active LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
    }
    const hubsQuery = `
      SELECT 
        h.*, 
        t.name AS truck_route_name, 
        t.active AS truck_route_active, 
        t.created_at AS truck_route_created_at, 
        t.updated_at AS truck_route_updated_at
      FROM hubs h
      LEFT JOIN truck_routes t ON h.route_id = t.id 
      ${whereClause}
      ORDER BY ${sortColumn} ${validSortOrder} 
      LIMIT ? OFFSET ?;
  `;
    params.push(limit, offset);
    const [hubs] = await databaseConnection_1.db
        .promise()
        .query(hubsQuery, params);
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM hubs h
      LEFT JOIN truck_routes t ON h.route_id = t.id 
      ${whereClause}
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(countQuery, params.slice(0, -2));
    const total = rows[0]?.total || 0;
    return { hubs, totalRecords: total };
};
exports.getAllHubs = getAllHubs;
// Create a new hub
const createHub = async (routeId, name, otherDetails, active) => {
    await databaseConnection_1.db
        .promise()
        .query("INSERT INTO hubs (route_id, name, other_details, active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())", [routeId, name, otherDetails, active]);
};
exports.createHub = createHub;
// Fetch hub by ID
const getHubById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query(`SELECT 
        h.*,
          t.id AS truckRoute_id,
          t.name AS truckRoute_name,
          t.active AS truckRoute_active,
          t.created_at AS truckRoute_created_at,
          t.updated_at AS truckRoute_updated_at
      FROM hubs h
      LEFT JOIN truck_routes t ON h.route_id = t.id
      WHERE h.id = ?;`, [id]);
    return rows;
};
exports.getHubById = getHubById;
// Update hub by ID
const updateHubById = async (id, routeId, name, otherDetails, active) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE hubs SET route_id = ?, name = ?, other_details = ?, active = ?, updated_at = NOW() WHERE id = ?", [routeId, name, otherDetails, active, id]);
};
exports.updateHubById = updateHubById;
// Delete hub by ID
const deleteHubById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM hubs WHERE id = ?", [id]);
};
exports.deleteHubById = deleteHubById;
