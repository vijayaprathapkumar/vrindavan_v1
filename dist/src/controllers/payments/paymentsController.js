"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePayment = exports.updatePaymentController = exports.addPaymentController = exports.fetchPayments = void 0;
const paymentsModels_1 = require("../../models/payments/paymentsModels");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all payments for a user
const fetchPayments = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { total, payments } = await (0, paymentsModels_1.getAllPayments)(userId, page, limit);
        res.json((0, responseHandler_1.createResponse)(200, "Payments fetched successfully.", {
            payments,
            totalRecords: total,
            page,
            limit,
        }));
    }
    catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch payments."));
    }
};
exports.fetchPayments = fetchPayments;
// Add a new payment
const addPaymentController = async (req, res) => {
    const { price, description, userId } = req.body;
    const status = "active";
    const method = "wallet";
    try {
        const result = await (0, paymentsModels_1.addPayment)({ price, description, userId, status, method });
        if (result.affectedRows > 0) {
            res.status(201).json((0, responseHandler_1.createResponse)(201, "Payment added successfully."));
        }
        else {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Failed to add payment."));
        }
    }
    catch (error) {
        console.error("Error adding payment:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to add payment."));
    }
};
exports.addPaymentController = addPaymentController;
// Update a payment
const updatePaymentController = async (req, res) => {
    const { id } = req.params;
    const { price, description } = req.body;
    // Set default values for status and method
    const status = "active";
    const method = "wallet";
    try {
        await (0, paymentsModels_1.updatePayment)(Number(id), { price, description, status, method });
        res.json((0, responseHandler_1.createResponse)(200, "Payment updated successfully."));
    }
    catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update payment."));
    }
};
exports.updatePaymentController = updatePaymentController;
// Delete a payment by ID
const removePayment = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, paymentsModels_1.deletePaymentById)(Number(id));
        res.json((0, responseHandler_1.createResponse)(200, "Payment deleted successfully."));
    }
    catch (error) {
        console.error("Error deleting payment:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to delete payment."));
    }
};
exports.removePayment = removePayment;
