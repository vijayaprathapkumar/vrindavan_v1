"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deductFromWalletBalance = exports.deletePlaceOrderById = exports.updatePlaceOrder = exports.getPriceForNextOrder = exports.addPlaceOrder = exports.getAllPlaceOrders = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all place orders for a user
const getAllPlaceOrders = async (userId, page, limit) => {
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
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?;
    `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [userId, limit, offset]);
    const placeOrders = rows.map(row => ({
        id: row.id,
        price: row.price,
        description: row.description,
        user_id: row.user_id,
        status: row.status,
        method: row.method,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
    return { total, placeOrders };
};
exports.getAllPlaceOrders = getAllPlaceOrders;
// Add a new place order and update wallet balance
const addPlaceOrder = async (placeOrderData) => {
    const { price, description, userId, status, method } = placeOrderData;
    // Set a default description if none is provided
    const defaultDescription = description || `Default place order for user ${userId}`;
    const sql = `
    INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const values = [price, defaultDescription, userId, status, method];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        await (0, exports.deductFromWalletBalance)(userId, price);
        return result;
    }
    catch (error) {
        console.error("SQL Error:", error);
        throw new Error("Failed to add place order.");
    }
};
exports.addPlaceOrder = addPlaceOrder;
const getPriceForNextOrder = async (userId) => {
    const sql = `SELECT price FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;`;
    try {
        const [rows] = await databaseConnection_1.db.promise().query(sql, [userId]);
        return rows.length > 0 ? rows[0].price : null;
    }
    catch (error) {
        console.error("Error fetching price:", error);
        throw new Error("Failed to fetch price for the user.");
    }
};
exports.getPriceForNextOrder = getPriceForNextOrder;
// Update a place order and wallet balance
const updatePlaceOrder = async (id, placeOrderData) => {
    const { price, description, status, method } = placeOrderData;
    const currentOrderSql = `SELECT price, user_id FROM payments WHERE id = ?`;
    try {
        const [currentOrderRows] = await databaseConnection_1.db.promise().query(currentOrderSql, [id]);
        if (currentOrderRows.length === 0) {
            throw new Error("Place order not found.");
        }
        const currentOrder = currentOrderRows[0];
        const userId = currentOrder.user_id;
        await (0, exports.deductFromWalletBalance)(userId, currentOrder.price);
        const sql = `
      UPDATE payments 
      SET price = ?, description = ?, status = ?, method = ?, updated_at = NOW() 
      WHERE id = ?;
    `;
        const [result] = await databaseConnection_1.db.promise().query(sql, [price, description, status, method, id]);
        if (result.affectedRows === 0) {
            throw new Error("No changes made to the place order.");
        }
        await (0, exports.deductFromWalletBalance)(userId, price);
    }
    catch (error) {
        console.error("SQL Error:", error);
        throw new Error("Failed to update place order.");
    }
};
exports.updatePlaceOrder = updatePlaceOrder;
// Delete a place order by ID
const deletePlaceOrderById = async (id) => {
    const sql = `
    DELETE FROM payments 
    WHERE id = ?;
  `;
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, [id]);
        if (result.affectedRows === 0) {
            throw new Error("Place order not found.");
        }
    }
    catch (error) {
        console.error("SQL Error:", error);
        throw new Error("Failed to delete place order.");
    }
};
exports.deletePlaceOrderById = deletePlaceOrderById;
// Function to deduct the payment amount from the wallet balance
const deductFromWalletBalance = async (userId, amount) => {
    const sql = `
    UPDATE wallet_balances 
    SET balance = balance - ? 
    WHERE user_id = ?;
  `;
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, [amount, userId]);
        if (result.affectedRows === 0) {
            throw new Error("Wallet balance not found for the user.");
        }
    }
    catch (error) {
        console.error("Error updating wallet balance:", error);
        throw new Error("Failed to update wallet balance.");
    }
};
exports.deductFromWalletBalance = deductFromWalletBalance;
