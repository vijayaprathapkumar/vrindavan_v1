"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryPriority = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const updateDeliveryPriority = async (userId, deliveryPriority) => {
    const query = `
    UPDATE users
    SET delivery_priority = ?, updated_at = NOW()
    WHERE id = ?;
  `;
    const [result] = await databaseConnection_1.db
        .promise()
        .query(query, [deliveryPriority, userId]);
    return result;
};
exports.updateDeliveryPriority = updateDeliveryPriority;
