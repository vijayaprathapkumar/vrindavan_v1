"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrderStatus = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const checkOrderStatus = async (req, res) => {
    try {
        const now = new Date();
        const cutoffTime = new Date();
        cutoffTime.setHours(21, 30, 0, 0);
        if (now < cutoffTime) {
            // Before 9:30 PM: Orders can be generated
            return res.status(200).json((0, responseHandler_1.createResponse)(200, "Orders can still be generated for tomorrow.", {
                message: "Orders can still be generated.",
                status: 1,
            }));
        }
        else {
            // After 9:30 PM: Orders cannot be generated
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "Order generation for tomorrow is closed.", {
                message: "Order generation for tomorrow is closed.",
                status: 0,
            }));
        }
    }
    catch (error) {
        console.error("Error checking order status:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to retrieve order status"));
    }
};
exports.checkOrderStatus = checkOrderStatus;
