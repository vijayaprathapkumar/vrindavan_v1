"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDetailedCommissionById = exports.updateDetailedCommissionById = exports.createDetailedCommission = exports.getDetailedCommissionById = exports.getAllDetailedCommissions = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all detailed commissions
const getAllDetailedCommissions = async () => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM detailed_commission");
    return rows;
};
exports.getAllDetailedCommissions = getAllDetailedCommissions;
// Fetch detailed commission by ID
const getDetailedCommissionById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM detailed_commission WHERE id = ?", [id]);
    return rows;
};
exports.getDetailedCommissionById = getDetailedCommissionById;
// Create a new detailed commission
const createDetailedCommission = async (monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year) => {
    await databaseConnection_1.db.promise().query("INSERT INTO detailed_commission (monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year]);
};
exports.createDetailedCommission = createDetailedCommission;
// Update detailed commission by ID
const updateDetailedCommissionById = async (id, monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year) => {
    await databaseConnection_1.db.promise().query("UPDATE detailed_commission SET monthly_commission_id = ?, delivery_boy_id = ?, product_id = ?, quantity = ?, commission = ?, total_commission = ?, month = ?, year = ? WHERE id = ?", [monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year, id]);
};
exports.updateDetailedCommissionById = updateDetailedCommissionById;
// Delete detailed commission by ID
const deleteDetailedCommissionById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM detailed_commission WHERE id = ?", [id]);
};
exports.deleteDetailedCommissionById = deleteDetailedCommissionById;
