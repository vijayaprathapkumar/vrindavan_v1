"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerById = exports.updateCustomerById = exports.getCustomerById = exports.createCustomer = exports.getAllCustomers = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all customers
const getAllCustomers = async () => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM Customers");
    return rows;
};
exports.getAllCustomers = getAllCustomers;
// Create a new customer
const createCustomer = async (locality, name, email, mobile, houseNo, completeAddress, status) => {
    await databaseConnection_1.db.promise().query("INSERT INTO Customers (locality, name, email, mobile, house_no, complete_address, status) VALUES (?, ?, ?, ?, ?, ?, ?)", [locality, name, email, mobile, houseNo, completeAddress, status]);
};
exports.createCustomer = createCustomer;
// Fetch customer by ID
const getCustomerById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query("SELECT * FROM Customers WHERE id = ?", [id]);
    return rows;
};
exports.getCustomerById = getCustomerById;
// Update customer by ID
const updateCustomerById = async (id, locality, name, email, mobile, houseNo, completeAddress, status) => {
    await databaseConnection_1.db.promise().query("UPDATE Customers SET locality = ?, name = ?, email = ?, mobile = ?, house_no = ?, complete_address = ?, status = ? WHERE id = ?", [locality, name, email, mobile, houseNo, completeAddress, status, id]);
};
exports.updateCustomerById = updateCustomerById;
// Delete customer by ID
const deleteCustomerById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM Customers WHERE id = ?", [id]);
};
exports.deleteCustomerById = deleteCustomerById;
