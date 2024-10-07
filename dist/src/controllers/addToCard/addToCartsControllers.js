"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCart = exports.updateCart = exports.addCart = exports.fetchCartItems = void 0;
const addToCartsModels_1 = require("../../models/addToCard/addToCartsModels");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all cart items for a user and update the payments table
const fetchCartItems = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId, limit, offset);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        await (0, addToCartsModels_1.updatePaymentByUserId)(userId, totalPrice);
        const totalCartItems = await (0, addToCartsModels_1.getCountOfCartItems)(userId);
        res.json((0, responseHandler_1.createResponse)(200, "Cart items fetched and payment updated successfully.", {
            cartItems,
            totalPrice,
            currentPage: page,
            totalPages: Math.ceil(totalCartItems / limit),
            totalItems: totalCartItems,
        }));
    }
    catch (error) {
        console.error("Error fetching cart items or updating payment:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch cart items or update payment."));
    }
};
exports.fetchCartItems = fetchCartItems;
// Add a new item to the cart and update the total price
const addCart = async (req, res) => {
    let { userId, foodId, quantity } = req.body;
    if (quantity === 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Quantity must be at least 1."));
    }
    try {
        await (0, addToCartsModels_1.addCartItem)({ userId, foodId, quantity });
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId, 10, 0);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        await (0, addToCartsModels_1.updatePaymentByUserId)(userId, totalPrice);
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
    let { quantity, userId } = req.body;
    if (quantity === 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Quantity must be at least 1."));
    }
    try {
        await (0, addToCartsModels_1.updateCartItem)(Number(id), quantity);
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId, 10, 0);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        await (0, addToCartsModels_1.updatePaymentByUserId)(userId, totalPrice);
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
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId, 10, 0);
        const totalPrice = cartItems.reduce((total, item) => {
            return total + item.food.price * item.quantity;
        }, 0);
        await (0, addToCartsModels_1.updatePaymentByUserId)(userId, totalPrice);
        res.json((0, responseHandler_1.createResponse)(200, "Cart item removed and payment updated."));
    }
    catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to remove cart item."));
    }
};
exports.removeCart = removeCart;
