"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCart = exports.updateCart = exports.fetchCartItemById = exports.addCart = exports.fetchCartItems = void 0;
const addToCartsModels_1 = require("../../models/addToCard/addToCartsModels");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all cart items for a user and update the payments table
const fetchCartItems = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    // Validate inputs
    if (isNaN(userId) || userId <= 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid user ID."));
    }
    if (isNaN(page) || page <= 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid page number."));
    }
    if (isNaN(limit) || limit <= 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid limit number."));
    }
    try {
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId, limit, offset);
        const totalPrice = cartItems.reduce((total, item) => {
            const itemPrice = item.food.discountPrice || item.food.price;
            return total + itemPrice * item.quantity;
        }, 0);
        const totalCartItems = await (0, addToCartsModels_1.getCountOfCartItems)(userId);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Cart items fetched successfully.", {
            cart: cartItems,
            totalPrice,
            currentPage: page,
            limit,
            totalPages: Math.ceil(totalCartItems / limit),
            totalItems: totalCartItems,
        }));
    }
    catch (error) {
        console.error(`Error fetching cart items for user ID ${userId} (page: ${page}, limit: ${limit}):`, error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch cart items."));
    }
};
exports.fetchCartItems = fetchCartItems;
// Add a new item to the cart
const addCart = async (req, res) => {
    const { userId, foodId, quantity } = req.body;
    if ((!userId && !foodId) || typeof quantity !== "number") {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid input data."));
    }
    if (quantity <= 0) {
        return res
            .status(400)
            .json((0, responseHandler_1.createResponse)(400, "Quantity must be at least 1."));
    }
    try {
        await (0, addToCartsModels_1.addCartItem)({ userId, foodId, quantity });
        return res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Item added to cart successfully."));
    }
    catch (error) {
        console.error("Error adding cart item:", error);
        if (error.code === "ER_DUP_ENTRY") {
            return res
                .status(409)
                .json((0, responseHandler_1.createResponse)(409, "Item already exists in the cart."));
        }
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to add item to cart."));
    }
};
exports.addCart = addCart;
const fetchCartItemById = async (req, res) => {
    const { id } = req.params;
    // Validate the ID
    if (isNaN(Number(id))) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid cart item ID."));
    }
    try {
        const cartItem = await (0, addToCartsModels_1.getCartItemById)(Number(id));
        if (!cartItem) {
            return res.status(404).json((0, responseHandler_1.createResponse)(404, "Cart item not found."));
        }
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Cart item fetched successfully.", cartItem));
    }
    catch (error) {
        console.error(`Error fetching cart item with ID ${id}:`, error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch cart item."));
    }
};
exports.fetchCartItemById = fetchCartItemById;
// Update an item in the cart and recalculate the total price
const updateCart = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    if (isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid cart item ID."));
    }
    if (quantity <= 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Quantity must be at least 1."));
    }
    try {
        await (0, addToCartsModels_1.updateCartItem)(Number(id), quantity);
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Cart item updated successfully.", null));
    }
    catch (error) {
        console.error("Error updating cart item:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update cart item."));
    }
};
exports.updateCart = updateCart;
// Delete a cart item and update the payment total price
const removeCart = async (req, res) => {
    const { id } = req.params;
    // Validate input
    if (isNaN(Number(id)) || Number(id) <= 0) {
        return res.status(400).json((0, responseHandler_1.createResponse)(400, "Invalid cart item ID."));
    }
    try {
        await (0, addToCartsModels_1.deleteCartItemById)(Number(id));
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Cart item removed successfully.", null));
    }
    catch (error) {
        console.error("Error removing cart item:", error);
        return res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to remove cart item."));
    }
};
exports.removeCart = removeCart;
