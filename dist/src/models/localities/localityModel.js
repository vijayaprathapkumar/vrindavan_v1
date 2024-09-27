"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocalityById = exports.updateLocalityById = exports.getLocalityById = exports.createLocality = exports.getAllLocalities = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all localities, ordered by created_at
const getAllLocalities = async () => {
    const [rows] = await databaseConnection_1.db.promise().query(`SELECT localities.*, hubs.name as hub_name 
     FROM localities 
     LEFT JOIN hubs ON localities.hub_id = hubs.id
     ORDER BY localities.created_at DESC`);
    return rows;
};
exports.getAllLocalities = getAllLocalities;
// Create a new locality
const createLocality = async (routeId, hubId, name, address, googleAddress, latitude, longitude, city, active) => {
    await databaseConnection_1.db.promise().query(`INSERT INTO localities 
      (route_id, hub_id, name, address, google_address, latitude, longitude, city, active, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, // Set created_at and updated_at to NOW()
    [routeId, hubId, name, address, googleAddress, latitude, longitude, city, active]);
};
exports.createLocality = createLocality;
// Fetch locality by ID
const getLocalityById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query(`SELECT localities.*, hubs.name as hub_name 
     FROM localities 
     LEFT JOIN hubs ON localities.hub_id = hubs.id
     WHERE localities.id = ?`, [id]);
    return rows;
};
exports.getLocalityById = getLocalityById;
// Update locality by ID
const updateLocalityById = async (id, routeId, hubId, name, address, googleAddress, latitude, longitude, city, active) => {
    await databaseConnection_1.db.promise().query(`UPDATE localities 
     SET route_id = ?, hub_id = ?, name = ?, address = ?, google_address = ?, latitude = ?, longitude = ?, city = ?, active = ?, updated_at = NOW() 
     WHERE id = ?`, // Update updated_at to NOW() when locality is updated
    [routeId, hubId, name, address, googleAddress, latitude, longitude, city, active, id]);
};
exports.updateLocalityById = updateLocalityById;
// Delete locality by ID
const deleteLocalityById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM localities WHERE id = ?", [id]);
};
exports.deleteLocalityById = deleteLocalityById;
