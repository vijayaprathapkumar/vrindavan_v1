"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomer = exports.addCustomer = exports.getCustomers = void 0;
const customerModel_1 = require("../../models/customer/customerModel");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all customers with pagination and filters
const getCustomers = async (req, res) => {
    const { page = 1, limit = 10, locality, status, searchTerm } = req.query;
    const validLimit = Number(limit) > 0 ? Number(limit) : 10;
    try {
        const { customers, total } = await (0, customerModel_1.getAllCustomers)(Number(page), validLimit, locality?.toString(), status?.toString(), searchTerm?.toString());
        const totalPages = Math.ceil(total / validLimit);
        res.status(200).json({
            statusCode: 200,
            message: "Customers fetched successfully",
            data: {
                customer: customers,
                totalCount: total,
                currentPage: Number(page),
                limit: validLimit,
                totalPage: totalPages,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching customers", error));
    }
};
exports.getCustomers = getCustomers;
// Add a new customer
const addCustomer = async (req, res) => {
    const { localityId, name, email, mobile, houseNo, completeAddress, status } = req.body;
    try {
        await (0, customerModel_1.createCustomer)(localityId, name, email, mobile, houseNo, completeAddress, status);
        res.status(201).json({
            statusCode: 201,
            message: "Customer created successfully",
            data: {
                customer: null,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating customer", error.message));
    }
};
exports.addCustomer = addCustomer;
// Get customer by ID
const getCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customer = await (0, customerModel_1.getCustomerById)(parseInt(id));
        if (!customer) {
            res.status(404).json({
                statusCode: 404,
                message: "Customer not found",
                data: {
                    customer: null,
                },
            });
        }
        else {
            res.status(200).json({
                statusCode: 200,
                message: "Customer fetched successfully",
                data: {
                    customer: [customer],
                },
            });
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
        res.status(200).json({
            statusCode: 200,
            message: "Customer updated successfully",
            data: {
                customer: {
                    id: parseInt(id),
                },
            },
        });
    }
    catch (error) {
        res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, error.message, { customer: null }));
    }
};
exports.updateCustomer = updateCustomer;
// Delete customer by ID
const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, customerModel_1.deleteCustomerById)(parseInt(id));
        res.status(200).json({
            statusCode: 200,
            message: "Customer deleted successfully",
            data: {
                customer: {
                    id: parseInt(id),
                },
            },
        });
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Error deleting customer", error));
    }
};
exports.deleteCustomer = deleteCustomer;
