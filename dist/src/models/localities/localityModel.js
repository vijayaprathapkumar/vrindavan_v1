"use strict";
// models/locality/localityModel.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocalityById = exports.updateLocalityById = exports.getLocalityById = exports.createLocality = exports.getAllLocalities = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all localities
const getAllLocalities = async () => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM localities");
    return rows;
};
exports.getAllLocalities = getAllLocalities;
// Create a new locality
const createLocality = async (routeId, hubId, name, address, googleAddress, latitude, longitude, city, active) => {
    await databaseConnection_1.db.promise().query("INSERT INTO localities (route_id, hub_id, name, address, google_address, latitude, longitude, city, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [routeId, hubId, name, address, googleAddress, latitude, longitude, city, active]);
};
exports.createLocality = createLocality;
// Fetch locality by ID
const getLocalityById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM localities WHERE id = ?", [id]);
    return rows;
};
exports.getLocalityById = getLocalityById;
// Update locality by ID
const updateLocalityById = async (id, routeId, hubId, name, address, googleAddress, latitude, longitude, city, active) => {
    await databaseConnection_1.db.promise().query("UPDATE localities SET route_id = ?, hub_id = ?, name = ?, address = ?, google_address = ?, latitude = ?, longitude = ?, city = ?, active = ? WHERE id = ?", [routeId, hubId, name, address, googleAddress, latitude, longitude, city, active, id]);
};
exports.updateLocalityById = updateLocalityById;
// Delete locality by ID
const deleteLocalityById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM localities WHERE id = ?", [id]);
};
exports.deleteLocalityById = deleteLocalityById;
