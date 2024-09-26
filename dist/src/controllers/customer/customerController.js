"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomer = exports.addCustomer = exports.getCustomers = void 0;
const customerModel_1 = require("../../models/customer/customerModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all customers with pagination and filters
// Fetch all customers with pagination and filters
const getCustomers = async (req, res) => {
    const { page = 1, limit = 10, locality, status, searchTerm } = req.query;
    // Allow any positive integer for limit, defaulting to 10 if not specified
    const validLimit = Number(limit) > 0 ? Number(limit) : 10;
    try {
        const { customers, total, statusCount } = await (0, customerModel_1.getAllCustomers)(Number(page), validLimit, locality?.toString(), status?.toString(), searchTerm?.toString());
        const totalPages = Math.ceil(total / validLimit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Customers fetched successfully", {
            customers,
            total,
            totalPages,
            currentPage: Number(page),
            limit: validLimit,
            locality: locality || 'All',
            statusCount,
        }));
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
        console.error("Error in addCustomer:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error creating customer", error.message));
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
        await (0, customerModel_1.updateCustomerById)(parseInt(id), localityId, name, email, mobile, houseNo, completeAddress, status);
        res.status(200).json({ message: "Customer updated successfully" });
    }
    catch (error) {
        console.error("Error updating customer:", error);
        res.status(400).json({ message: error.message });
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
