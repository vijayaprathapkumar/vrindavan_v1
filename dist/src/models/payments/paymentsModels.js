"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentById = exports.updatePayment = exports.addPayment = exports.getAllPayments = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all payments for a user
const getAllPayments = async (userId, page, limit) => {
    const offset = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) as total FROM payments WHERE user_id = ?`;
    const [countRows] = await databaseConnection_1.db.promise().query(countQuery, [userId]);
    const total = countRows[0].total;
    const query = `
      SELECT 
        id, 
        price, 
        description, 
        user_id, 
        status, 
        method, 
        created_at, 
        updated_at 
      FROM 
        payments 
      WHERE 
        user_id = ?
      ORDER BY created_at DESC -- or ORDER BY updated_at DESC
      LIMIT ? OFFSET ?;
    `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [userId, limit, offset]);
    const payments = rows.map(row => ({
        id: row.id,
        price: row.price,
        description: row.description,
        user_id: row.user_id,
        status: row.status,
        method: row.method,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
    return { total, payments };
};
exports.getAllPayments = getAllPayments;
// Add a new payment
const addPayment = async (paymentData) => {
    const { price, description, userId, status, method } = paymentData;
    const sql = `
    INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const values = [price, description, userId, status, method];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result; // Return the result to check for affected rows
    }
    catch (error) {
        console.error("SQL Error:", error); // Log SQL error
        throw new Error("Failed to add payment.");
    }
};
exports.addPayment = addPayment;
// Update a payment
const updatePayment = async (id, paymentData) => {
    const { price, description, status, method } = paymentData;
    const sql = `
      UPDATE payments 
      SET price = ?, description = ?, status = ?, method = ?, updated_at = NOW() 
      WHERE id = ?;
    `;
    const [result] = await databaseConnection_1.db.promise().query(sql, [price, description, status, method, id]);
    if (result.affectedRows === 0) {
        throw new Error("Payment not found or no changes made.");
    }
};
exports.updatePayment = updatePayment;
// Delete a payment by ID
const deletePaymentById = async (id) => {
    const sql = `
      DELETE FROM payments 
      WHERE id = ?;
    `;
    const [result] = await databaseConnection_1.db.promise().query(sql, [id]);
    if (result.affectedRows === 0) {
        throw new Error("Payment not found.");
    }
};
exports.deletePaymentById = deletePaymentById;
