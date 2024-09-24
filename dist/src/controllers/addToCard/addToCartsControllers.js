"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCart = exports.updateCart = exports.addCart = exports.fetchCartItems = void 0;
const addToCartsModels_1 = require("../../models/addToCard/addToCartsModels");
const responseHandler_1 = require("../../utils/responseHandler");
// Fetch all cart items for a user
const fetchCartItems = async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const cartItems = await (0, addToCartsModels_1.getAllCartItems)(userId);
        res.json((0, responseHandler_1.createResponse)(200, "Cart items fetched successfully.", cartItems));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to fetch cart items."));
    }
};
exports.fetchCartItems = fetchCartItems;
// Add a new cart item
const addCart = async (req, res) => {
    const { foodId, userId, quantity, specialInstructions } = req.body;
    try {
        const result = await (0, addToCartsModels_1.addCartItem)({ foodId, userId, quantity });
        if (result.affectedRows > 0) {
            res
                .status(201)
                .json((0, responseHandler_1.createResponse)(201, "Cart item added successfully."));
        }
        else {
            res.status(400).json((0, responseHandler_1.createResponse)(400, "Failed to add cart item."));
        }
    }
    catch (error) {
        console.error("Error adding cart item:", error);
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to add cart item."));
    }
};
exports.addCart = addCart;
// Update a cart item
const updateCart = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        await (0, addToCartsModels_1.updateCartItem)(Number(id), quantity);
        res.json((0, responseHandler_1.createResponse)(200, "Cart item updated successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to update cart item."));
    }
};
exports.updateCart = updateCart;
// Delete a cart item by ID
const removeCart = async (req, res) => {
    const { id } = req.params;
    try {
        await (0, addToCartsModels_1.deleteCartItemById)(Number(id));
        res.json((0, responseHandler_1.createResponse)(200, "Cart item deleted successfully."));
    }
    catch (error) {
        res.status(500).json((0, responseHandler_1.createResponse)(500, "Failed to delete cart item."));
    }
};
exports.removeCart = removeCart;
