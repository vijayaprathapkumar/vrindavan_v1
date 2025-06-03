"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneTimeOrdersInCustomer = exports.placeOneTimeOrder = void 0;
const placeOrderModels_1 = require("../../models/placeOrder/placeOrderModels");
const responseHandler_1 = require("../../utils/responseHandler");
const dealOfTheDayModel_1 = require("../../models/dealOfTheDay/dealOfTheDayModel");
// Add a place order and clear the cart
const placeOneTimeOrder = async (req, res) => {
    const { userId, orderDate } = req.body;
    try {
        const cartItems = await (0, placeOrderModels_1.getCartItemsByUserId)(userId);
        if (!cartItems.length) {
            return res.status(400).json((0, responseHandler_1.createResponse)(400, "No items in cart."));
        }
        const orderPromises = cartItems.map(async (item) => {
            if (item.quantity > 0) {
                await placeOrder(item, userId, orderDate);
            }
            else {
                console.log("Failed to add place order.");
            }
        });
        await Promise.all(orderPromises);
        await (0, placeOrderModels_1.deleteAllCartItemsByUserId)(userId);
        return res
            .status(201)
            .json((0, responseHandler_1.createResponse)(201, "Place order added successfully, cart cleared, and wallet updated.", null));
    }
    catch (error) {
        console.error("Error adding place order:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Failed to add place order."));
    }
};
exports.placeOneTimeOrder = placeOneTimeOrder;
const placeOrder = async (productData, user_id, orderDate) => {
    const { price, food_id, quantity } = productData;
    const deal = await (0, dealOfTheDayModel_1.getDealByFoodId)(food_id);
    let productAmount;
    if (deal && deal.quantity > 0) {
        productAmount = deal.offer_price;
        await (0, dealOfTheDayModel_1.updateFoodDiscountPrice)(food_id, deal.offer_price);
    }
    else {
        productAmount = price;
    }
    if (productAmount > 0) {
        const orderData = await (0, placeOrderModels_1.addOrdersEntry)(user_id, orderDate);
        if (orderData?.orderId) {
            await (0, placeOrderModels_1.addFoodOrderEntry)(productAmount, quantity, food_id, orderData.orderId);
            if (deal && deal.quantity > 0) {
                const updatedDeal = (await (0, dealOfTheDayModel_1.updateDealQuantity)(food_id, quantity));
                if (updatedDeal?.quantity === 0) {
                    await (0, dealOfTheDayModel_1.resetFoodDiscountPrice)(food_id);
                    console.log(`Deal for food ID ${food_id} is now inactive.`);
                }
            }
            return;
        }
    }
    console.log("Failed to place order for item: " + food_id);
    return null;
};
//admin panel One time order
const oneTimeOrdersInCustomer = async (req, res) => {
    try {
        const { user_id, orderDate, productData } = req.body;
        console.log("body date", orderDate);
        if (!user_id || !orderDate || !productData) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const { discount_price, price, food_id, quantity } = productData;
        const productAmount = discount_price > 0 ? discount_price : price;
        if (productAmount <= 0) {
            return res.status(400).json({ message: "Invalid product amount" });
        }
        const orderData = await (0, placeOrderModels_1.addOrdersEntry)(user_id, orderDate);
        if (orderData?.orderId) {
            await (0, placeOrderModels_1.addFoodOrderEntry)(productAmount, quantity, food_id, orderData.orderId);
            return res.status(201).json({
                message: "Order placed successfully",
                orderId: orderData.orderId,
            });
        }
        else {
            console.error("Failed to create order entry");
            return res.status(500).json({ message: "Failed to place order" });
        }
    }
    catch (error) {
        console.error("Error placing order:", error);
        return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
};
exports.oneTimeOrdersInCustomer = oneTimeOrdersInCustomer;
