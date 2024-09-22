"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomer = exports.addCustomer = exports.getCustomers = void 0;
const customerModel_1 = require("../../models/customer/customerModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all customers
const getCustomers = async (req, res) => {
    try {
        const customers = await (0, customerModel_1.getAllCustomers)();
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Customers fetched successfully", customers));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching customers", error));
    }
};
exports.getCustomers = getCustomers;
// Add a new customer
const addCustomer = async (req, res) => {
    const { localityId, name, email, mobile, houseNo, completeAddress, status } = req.body;
    try {
        await (0, customerModel_1.createCustomer)(localityId, name, email, mobile, houseNo, completeAddress, status);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Customer created successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating customer", error));
    }
};
exports.addCustomer = addCustomer;
// Get customer by ID
const getCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await (0, customerModel_1.getCustomerById)(parseInt(id));
        if (!customer) {
            res.status(404).json((0, responseHandler_1.createResponse)(404, "Customer not found"));
        }
        else {
            res.status(200).json((0, responseHandler_1.createResponse)(200, "Customer fetched successfully", customer));
        }
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error fetching customer", error));
    }
};
exports.getCustomer = getCustomer;
// Update customer by ID
const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { localityId, name, email, mobile, houseNo, completeAddress, status } = req.body;
    try {
        // Pass undefined if status is not provided
        await (0, customerModel_1.updateCustomerById)(Number(id), localityId, name, email, mobile, houseNo, completeAddress, status || undefined);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Customer updated successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error updating customer", error));
    }
};
exports.updateCustomer = updateCustomer;
// Delete customer by ID
const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, customerModel_1.deleteCustomerById)(parseInt(id));
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Customer deleted successfully"));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting customer", error));
    }
};
exports.deleteCustomer = deleteCustomer;
