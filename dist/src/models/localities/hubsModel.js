"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHubById = exports.updateHubById = exports.getHubById = exports.createHub = exports.getAllHubs = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all hubs
const getAllHubs = async (page, limit, searchTerm) => {
    const offset = (page - 1) * limit;
    const hubsQuery = `
        SELECT * FROM hubs 
        WHERE name LIKE ? 
        ORDER BY 
            COALESCE(updated_at, created_at) DESC 
        LIMIT ? OFFSET ?
    `;
    const [hubs] = await databaseConnection_1.db.promise().query(hubsQuery, [`%${searchTerm}%`, limit, offset]);
    const countQuery = `
        SELECT COUNT(*) as total FROM hubs 
        WHERE name LIKE ?
    `;
    const [rows] = await databaseConnection_1.db.promise().query(countQuery, [`%${searchTerm}%`]);
    const total = rows[0].total;
    return { hubs, totalRecords: total };
};
exports.getAllHubs = getAllHubs;
// Create a new hub
const createHub = async (routeId, name, otherDetails, active) => {
    await databaseConnection_1.db.promise().query("INSERT INTO hubs (route_id, name, other_details, active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())", [routeId, name, otherDetails, active]);
};
exports.createHub = createHub;
// Fetch hub by ID
const getHubById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM hubs WHERE id = ?", [id]);
    return rows;
};
exports.getHubById = getHubById;
// Update hub by ID
const updateHubById = async (id, routeId, name, otherDetails, active) => {
    await databaseConnection_1.db.promise().query("UPDATE hubs SET route_id = ?, name = ?, other_details = ?, active = ?, updated_at = NOW() WHERE id = ?", [routeId, name, otherDetails, active, id]);
};
exports.updateHubById = updateHubById;
// Delete hub by ID
const deleteHubById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM hubs WHERE id = ?", [id]);
};
exports.deleteHubById = deleteHubById;
