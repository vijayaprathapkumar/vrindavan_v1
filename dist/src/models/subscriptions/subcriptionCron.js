"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
exports.handleNextDayOrders = handleNextDayOrders;
const moment_1 = __importDefault(require("moment"));
const databaseConnection_1 = require("../../config/databaseConnection");
async function fetchSubscriptions(lastId = 0, batchSize) {
    const [subscriptions] = await databaseConnection_1.db
        .promise()
        .query(`SELECT * FROM user_subscriptions 
         WHERE active = 1 
         AND is_pause_subscription = 0 
         AND id > ? 
         LIMIT ?`, [lastId, batchSize]);
    return subscriptions;
}
// Handle the next day's orders based on user subscriptions
async function handleNextDayOrders() {
    const tomorrow = (0, moment_1.default)().add(1, "days");
    const dayOfWeek = tomorrow.format("dddd").toLowerCase();
    let lastId = 0;
    const batchSize = 100;
    while (true) {
        const subscriptions = await fetchSubscriptions(lastId, batchSize);
        if (subscriptions.length === 0)
            break;
        await Promise.all(subscriptions.map(async (sub) => {
            let quantityToOrder = 0;
            const lastOrderDate = (0, moment_1.default)(sub.last_order_date);
            switch (sub.subscription_type) {
                case "everyday":
                    quantityToOrder = sub.quantity;
                    break;
                case "alternative_day":
                    if (tomorrow.diff(lastOrderDate, "days") % 2 === 0) {
                        quantityToOrder = sub.quantity;
                    }
                    break;
                case "every_3_day":
                    if (tomorrow.diff(lastOrderDate, "days") % 3 === 0) {
                        quantityToOrder = sub.quantity;
                    }
                    break;
                case "every_7_day":
                    if (tomorrow.diff(lastOrderDate, "days") % 7 === 0) {
                        quantityToOrder = sub.quantity;
                    }
                    break;
                case "customize":
                    quantityToOrder = sub[`${dayOfWeek}Qty`];
                    break;
                default:
                    return;
            }
            if (quantityToOrder > 0) {
                await (0, exports.createOrder)(sub, quantityToOrder);
            }
        }));
        lastId = subscriptions[subscriptions.length - 1].id;
    }
}
// Create an order based on subscription
const createOrder = async (orderItem, quantityToOrder) => {
    const { product_id, user_id } = orderItem || {};
    try {
        const productData = await getProductById(product_id);
        if (!productData || productData.length === 0) {
            console.warn(`Product with ID ${product_id} not found. Skipping order for user ${user_id}.`);
            return;
        }
        const { discount_price, price } = productData[0];
        const productAmount = discount_price ? discount_price : price;
        if (productAmount > 0) {
            const orderData = await addOrdersEntry(user_id);
            if (orderData?.orderId) {
                await addFoodOrderEntry(productAmount, quantityToOrder, product_id, orderData.orderId);
            }
        }
    }
    catch (error) {
        console.error(`Error creating order for user ${orderItem.user_id}:`, error);
        throw new Error("Failed to create order.");
    }
};
exports.createOrder = createOrder;
const getProductById = async (product_id) => {
    const query = `
      SELECT f.id AS food_id, f.name AS food_name, f.price, f.discount_price
      FROM foods f
      WHERE f.id = ?;
    `;
    try {
        const [productRows] = await databaseConnection_1.db
            .promise()
            .query(query, [product_id]);
        return productRows;
    }
    catch (error) {
        console.error(`Error fetching product with ID ${product_id}:`, error);
        throw new Error("Error fetching product.");
    }
};
const addOrdersEntry = async (userId) => {
    const addressSql = `
      SELECT da.id AS delivery_address_id, da.*, l.route_id, l.hub_id
      FROM delivery_addresses da
      LEFT JOIN localities l ON da.locality_id = l.id
      WHERE da.user_id = ?;
    `;
    try {
        const [addressRows] = await databaseConnection_1.db.promise().query(addressSql, [userId]);
        const addressData = addressRows[0];
        if (!addressData || !addressData.locality_id || !addressData.hub_id) {
            console.warn(`Skipping order creation for user ${userId} due to missing hub or locality.`);
            return null;
        }
        const { route_id, hub_id, locality_id, delivery_address_id } = addressData;
        const orderSql = `
        INSERT INTO orders (
          user_id, order_type, order_date, route_id, hub_id, locality_id, 
          order_status_id, tax, delivery_fee, delivery_address_id, is_wallet_deduct, 
          created_at, updated_at
        ) 
        VALUES (?, 2, NOW(), ?, ?, ?, 1, 0.0, 0.0, ?, 1, NOW(), NOW());
      `;
        const [orderResult] = await databaseConnection_1.db
            .promise()
            .query(orderSql, [
            userId,
            route_id,
            hub_id,
            locality_id,
            delivery_address_id,
        ]);
        if (!orderResult?.insertId) {
            console.error(`Order creation failed for user ${userId}.`);
            return null; // Return null to indicate a failed order creation
        }
        return {
            status: true,
            orderId: orderResult.insertId,
            message: "Order created successfully",
        };
    }
    catch (error) {
        console.error(`Error creating order for user ${userId}:`, error);
        throw new Error("Error creating order.");
    }
};
const addFoodOrderEntry = async (productAmount, quantity, productId, orderId) => {
    const foodOrderSql = `
      INSERT INTO food_orders (
        price, quantity, food_id, order_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
    try {
        await databaseConnection_1.db
            .promise()
            .query(foodOrderSql, [productAmount, quantity, productId, orderId]);
    }
    catch (error) {
        console.error(`Error creating food order for order ${orderId}:`, error);
        throw new Error("Error creating food order.");
    }
};
