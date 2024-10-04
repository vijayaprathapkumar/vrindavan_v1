"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCart = exports.updateCart = exports.addCart = exports.updatePaymentByUserId = exports.fetchCartItems = void 0;
const addToCartsModels_1 = require("../../models/addToCard/addToCartsModels");
const responseHandler_1 = require("../../utils/responseHandler");
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all cart items for a user and update the payments table
const fetchCartItems = async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        await (0, exports.updatePaymentByUserId)(userId, totalPrice);
        res.json((0, responseHandler_1.createResponse)(200, "Cart items fetched and payment updated successfully.", {
            cartItems,
            totalPrice,
        }));
    }
    catch (error) {
        console.error("Error fetching cart items or updating payment:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch cart items or update payment."));
    }
};
exports.fetchCartItems = fetchCartItems;
// Update the payment total for a user in the payments table
const updatePaymentByUserId = async (userId, totalPrice) => {
    const updateSql = `
    UPDATE payments 
    SET price = ?, updated_at = NOW() 
    WHERE user_id = ? AND status = 'active';
  `;
    const insertSql = `
    INSERT INTO payments (user_id, price, status, created_at, updated_at) 
    VALUES (?, ?, 'active', NOW(), NOW());
  `;
    try {
        const [updateResult] = await databaseConnection_1.db.promise().query(updateSql, [totalPrice, userId]);
        if (updateResult.affectedRows === 0) {
            await databaseConnection_1.db.promise().query(insertSql, [userId, totalPrice]);
        }
    }
    catch (error) {
        console.error("Error updating or inserting payment:", error);
        throw new Error("Failed to update or insert payment.");
    }
};
exports.updatePaymentByUserId = updatePaymentByUserId;
// Add a new item to the cart and update the total price
const addCart = async (req, res) => {
    const { userId, foodId, quantity } = req.body;
    try {
        await (0, addToCartsModels_1.addCartItem)({ userId, foodId, quantity });
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        await (0, exports.updatePaymentByUserId)(userId, totalPrice);
        res.status(201).json((0, responseHandler_1.createResponse)(201, "Item added to cart and payment updated."));
    }
    catch (error) {
        console.error("Error adding cart item:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to add item to cart."));
    }
};
exports.addCart = addCart;
// Update an item in the cart and recalculate the total price
const updateCart = async (req, res) => {
    const { id } = req.params;
    const { quantity, userId } = req.body;
    try {
        await (0, addToCartsModels_1.updateCartItem)(Number(id), quantity);
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        // Update the payment with the new total price
        await (0, exports.updatePaymentByUserId)(userId, totalPrice);
        res.json((0, responseHandler_1.createResponse)(200, "Cart item updated and payment adjusted."));
    }
    catch (error) {
        console.error("Error updating cart item:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update cart item."));
    }
};
exports.updateCart = updateCart;
// Delete a cart item and update the payment total price
const removeCart = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
        await (0, addToCartsModels_1.deleteCartItemById)(Number(id));
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        await (0, exports.updatePaymentByUserId)(userId, totalPrice);
        res.json((0, responseHandler_1.createResponse)(200, "Cart item removed and payment updated."));
    }
    catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to remove cart item."));
    }
};
exports.removeCart = removeCart;
