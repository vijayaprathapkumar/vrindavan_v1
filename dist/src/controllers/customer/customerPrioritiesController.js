"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerPriority = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const customerPrioritiesModel_1 = require("../../models/customer/customerPrioritiesModel");
// Controller to handle the update of delivery_priority
const updateCustomerPriority = async (req, res) => {
    const { userId, deliveryPriority } = req.body;
    if (!userId || !deliveryPriority) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "User ID and delivery priority are required."));
    }
    try {
        const result = await (0, customerPrioritiesModel_1.updateDeliveryPriority)(userId, deliveryPriority);
        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json((0, responseHandler_1.createResponse)(404, "User not found or no changes made."));
        }
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Delivery priority updated successfully."));
    }
    catch (error) {
        console.error("Error updating delivery priority:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error updating delivery priority", error.message));
    }
};
exports.updateCustomerPriority = updateCustomerPriority;
