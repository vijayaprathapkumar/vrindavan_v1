"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomer = exports.addCustomer = exports.getCustomers = void 0;
const customerModel_1 = require("../../models/customer/customerModel");
const responseHandler_1 = require("../../utils/responseHandler");
const authLoginModel_1 = require("../../models/authLogin/authLoginModel");
const getCustomers = async (req, res) => {
    const { locality, status, searchTerm, sortField, sortOrder } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    try {
        const { customers, total, statusCount } = await (0, customerModel_1.getAllCustomers)(page, limit, locality?.toString(), status?.toString(), searchTerm?.toString(), sortField?.toString(), sortOrder?.toString());
        const totalPages = Math.ceil(total / limit);
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Customers fetched successfully", {
            customers,
            totalCount: total,
            currentPage: page,
            limit: limit,
            totalPages,
            statusCount,
        }));
    }
    catch (error) {
        res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching customers", error));
    }
};
exports.getCustomers = getCustomers;
const addCustomer = async (req, res) => {
    const { localityId, name, email, mobile, houseNo, completeAddress, status } = req.body;
    try {
        const userId = await (0, customerModel_1.createCustomer)(localityId, name, email, mobile, houseNo, completeAddress, status);
        if (userId === null) {
            return res
                .status(400)
                .json((0, responseHandler_1.createResponse)(400, "This email is already registered."));
        }
        if (userId === 0) {
            return res
                .status(400)
                .json((0, responseHandler_1.createResponse)(400, "This mobile is already registered."));
        }
        const { status: userProfileStatus } = await (0, authLoginModel_1.checkUserProfileStatus)(mobile);
        return res.status(201).json((0, responseHandler_1.createResponse)(201, "Customer created successfully.", {
            user_profile: userProfileStatus,
            user_id: userId,
        }));
    }
    catch (error) {
        console.error("Error creating customer:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error creating customer", error.message));
    }
};
exports.addCustomer = addCustomer;
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
            return;
        }
        res.status(200).json({
            statusCode: 200,
            message: "Customer fetched successfully",
            data: {
                customer: [customer],
            },
        });
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
