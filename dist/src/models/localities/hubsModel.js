"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHubById = exports.updateHubById = exports.getHubById = exports.createHub = exports.getAllHubs = void 0;
const databaseConnection_1 = require("../../config/databaseConnection"); // Adjust the path to your database connection
// Fetch all hubs
const getAllHubs = async () => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM hubs");
    return rows;
};
exports.getAllHubs = getAllHubs;
// Create a new hub
const createHub = async (routeId, name, otherDetails, active) => {
    await databaseConnection_1.db.promise().query("INSERT INTO hubs (route_id, name, other_details, active) VALUES (?, ?, ?, ?)", [routeId, name, otherDetails, active]);
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
    await databaseConnection_1.db.promise().query("UPDATE hubs SET route_id = ?, name = ?, other_details = ?, active = ? WHERE id = ?", [routeId, name, otherDetails, active, id]);
};
exports.updateHubById = updateHubById;
// Delete hub by ID
const deleteHubById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM hubs WHERE id = ?", [id]);
};
exports.deleteHubById = deleteHubById;
