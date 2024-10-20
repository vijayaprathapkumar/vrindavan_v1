"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartItemsByUserId = exports.getPlaceOrderById = exports.deleteAllCartItemsByUserId = exports.deductFromWalletBalance = exports.insertIntoOrderPayment = exports.deletePlaceOrderById = exports.updatePlaceOrder = exports.getPriceForNextOrder = exports.addPlaceOrder = exports.orderTypes = exports.getAllPlaceOrders = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllPlaceOrders = async (userId, page, limit, startDate, endDate, searchTerm) => {
    const offset = (page - 1) * limit;
    let searchCondition = "";
    let dateCondition = "";
    let queryParams = [userId];
    // Search term condition
    if (searchTerm) {
        searchCondition = `AND (p.description LIKE ? OR p.status LIKE ? OR p.method LIKE ?)`;
        const searchValue = `%${searchTerm}%`;
        queryParams.push(searchValue, searchValue, searchValue);
    }
    // Date range condition
    if (startDate) {
        dateCondition += " AND o.order_date >= ?";
        queryParams.push(startDate.toISOString().slice(0, 10));
    }
    if (endDate) {
        dateCondition += " AND o.order_date <= ?";
        queryParams.push(endDate.toISOString().slice(0, 10));
    }
    // Count total number of orders
    const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    INNER JOIN payments p ON o.payment_id = p.id
    INNER JOIN order_logs ol ON o.id = ol.order_id
    WHERE o.user_id = ? ${searchCondition} ${dateCondition}
  `;
    const [countRows] = await databaseConnection_1.db
        .promise()
        .query(countQuery, queryParams);
    const total = countRows[0].total;
    // Main query to fetch orders and related data, including food name from foods table
    const query = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.order_type,
      o.order_date,
      o.route_id,
      o.hub_id,
      o.locality_id,
      o.delivery_boy_id,
      o.order_status_id,
      o.tax,
      o.delivery_fee,
      o.hint,
      o.active,
      o.driver_id,
      o.delivery_address_id,
      o.payment_id,
      o.is_wallet_deduct,
      o.delivery_status,
      o.created_at AS order_created_at,
      o.updated_at AS order_updated_at,

      fo.id AS food_order_id,
      fo.price AS food_price,
      fo.quantity AS food_quantity,
      fo.created_at AS food_order_created_at,
      fo.updated_at AS food_order_updated_at,

      f.name AS food_name  

    FROM 
      orders o
    LEFT JOIN 
      food_orders fo ON o.id = fo.order_id
    LEFT JOIN 
      foods f ON fo.food_id = f.id  

    WHERE 
      o.user_id = ? ${dateCondition} ${searchCondition}
    LIMIT ?, ?
  `;
    queryParams.push(offset, limit);
    const [placeOrderRows] = await databaseConnection_1.db
        .promise()
        .query(query, queryParams);
    // Structure the result
    const structuredOrders = placeOrderRows.reduce((orders, row) => {
        // Check if the order already exists in the orders list
        let existingOrder = orders.find((order) => order.order_id === row.order_id);
        if (!existingOrder) {
            // If the order doesn't exist, create a new one
            existingOrder = {
                order_id: row.order_id,
                user_id: row.user_id,
                order_type: row.order_type,
                order_date: row.order_date,
                route_id: row.route_id,
                hub_id: row.hub_id,
                locality_id: row.locality_id,
                delivery_boy_id: row.delivery_boy_id,
                order_status_id: row.order_status_id,
                tax: row.tax,
                delivery_fee: row.delivery_fee,
                hint: row.hint,
                active: row.active,
                driver_id: row.driver_id,
                delivery_address_id: row.delivery_address_id,
                payment_id: row.payment_id,
                is_wallet_deduct: row.is_wallet_deduct,
                delivery_status: row.delivery_status,
                created_at: row.order_created_at,
                updated_at: row.order_updated_at,
                food_orders: [],
                total_quantity: 0,
                total_amount: 0,
            };
            orders.push(existingOrder);
        }
        const foodOriginalPrice = row.food_price * row.food_quantity;
        // Add food order to the existing order
        existingOrder.food_orders.push({
            food_order_id: row.food_order_id,
            price: row.food_price,
            quantity: row.food_quantity,
            name: row.food_name,
            created_at: row.food_order_created_at,
            updated_at: row.food_order_updated_at,
            foodOriginalPrice: foodOriginalPrice,
        });
        existingOrder.total_amount += foodOriginalPrice;
        existingOrder.total_quantity += row.food_quantity;
        return orders;
    }, []);
    return { total, placeOrders: structuredOrders };
};
exports.getAllPlaceOrders = getAllPlaceOrders;
exports.orderTypes = {
    all: "All",
    1: "Instant Order",
    2: "Subscription",
    3: "One Day Order",
    5: "App Order",
};
const addPlaceOrder = async (placeOrderData) => {
    const { price, description, userId, status, method } = placeOrderData;
    const defaultDescription = description || `Default place order for user ${userId}`;
    const paymentSql = `
    INSERT INTO payments (price, description, user_id, status, method, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;
    const paymentValues = [price, defaultDescription, userId, status, method];
    try {
        const [paymentResult] = await databaseConnection_1.db
            .promise()
            .query(paymentSql, paymentValues);
        if (paymentResult.affectedRows === 0) {
            throw new Error("Payment insertion failed.");
        }
        const walletBalanceSql = `
      SELECT balance FROM wallet_balances WHERE user_id = ?;
    `;
        const [walletRows] = await databaseConnection_1.db
            .promise()
            .query(walletBalanceSql, [userId]);
        if (walletRows.length === 0) {
            throw new Error(`No wallet balance found for user ${userId}.`);
        }
        const beforeBalance = walletRows[0].balance;
        const afterBalance = (beforeBalance - price).toFixed(2);
        const deductionSuccess = await (0, exports.deductFromWalletBalance)(userId, price);
        if (!deductionSuccess) {
            throw new Error("Failed to deduct from wallet balance.");
        }
        const walletLogSql = `
      INSERT INTO wallet_logs (
        user_id, 
        order_id, 
        order_date, 
        order_item_id, 
        before_balance, 
        amount, 
        after_balance, 
        wallet_type, 
        description, 
        created_at, 
        updated_at
      ) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;
        const walletLogValues = [
            userId,
            null,
            paymentResult.insertId,
            beforeBalance,
            price,
            afterBalance,
            "deduction",
            `Rs ${price} deducted from Rs ${beforeBalance}`,
        ];
        const addressSql = `
      SELECT da.id AS delivery_address_id, da.*, l.route_id, l.hub_id, l.name AS locality_name
      FROM delivery_addresses da
      LEFT JOIN localities l ON da.locality_id = l.id
      WHERE da.user_id = ?;
    `;
        const [addressRows] = await databaseConnection_1.db
            .promise()
            .query(addressSql, [userId]);
        if (addressRows.length === 0 ||
            !addressRows[0].locality_id ||
            !addressRows[0].hub_id) {
            throw new Error(`Missing locality or hub information for user ${userId}. Please add the correct address details.`);
        }
        const addressData = addressRows[0];
        const { route_id, hub_id, locality_id, delivery_address_id } = addressData;
        const orderSql = `
      INSERT INTO orders (
        user_id, 
        order_type, 
        order_date, 
        route_id, 
        hub_id, 
        locality_id, 
        delivery_boy_id, 
        order_status_id, 
        tax, 
        delivery_fee, 
        payment_id, 
        delivery_address_id,
        is_wallet_deduct, 
        created_at, 
        updated_at
      ) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;
        const orderValues = [
            userId,
            1, // Assuming order_type is 1
            route_id,
            hub_id,
            locality_id,
            null, // delivery_boy_id
            1, // order_status_id
            0.0, // tax
            0.0, // delivery_fee
            paymentResult.insertId,
            delivery_address_id,
            1, // is_wallet_deduct
        ];
        const [orderResult] = await databaseConnection_1.db
            .promise()
            .query(orderSql, orderValues);
        if (orderResult.affectedRows === 0) {
            throw new Error("Failed to create order.");
        }
        const orderId = orderResult.insertId;
        walletLogValues[1] = orderId;
        await databaseConnection_1.db.promise().query(walletLogSql, walletLogValues);
        const cartItems = await (0, exports.getCartItemsByUserId)(userId);
        // Insert into food_orders
        for (const item of cartItems) {
            // Use discount_price if available, otherwise fallback to price
            console.log("item", item);
            const finalPrice = item.food.discountPrice !== null &&
                item.food.discountPrice !== undefined
                ? item.food.discountPrice
                : item.food.price;
            console.log("finalPrice", finalPrice);
            const foodOrderSql = `
    INSERT INTO food_orders (
      price,
      quantity,
      food_id,
      order_id,
      created_at,
      updated_at
    ) 
    VALUES (?, ?, ?, ?, NOW(), NOW());
  `;
            const foodOrderValues = [
                finalPrice,
                item.quantity,
                item.food_id,
                orderId,
            ];
            await databaseConnection_1.db.promise().query(foodOrderSql, foodOrderValues);
        }
        await (0, exports.insertIntoOrderPayment)(userId, paymentResult.insertId);
        return paymentResult;
    }
    catch (error) {
        console.error("SQL Error in addPlaceOrder:", error);
        throw new Error("Failed to add place order.");
    }
};
exports.addPlaceOrder = addPlaceOrder;
const getPriceForNextOrder = async (userId) => {
    const sql = `SELECT price FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1;`;
    try {
        const [rows] = await databaseConnection_1.db
            .promise()
            .query(sql, [userId]);
        return rows.length > 0 ? rows[0].price : null;
    }
    catch (error) {
        console.error("Error fetching price:", error);
        throw new Error("Failed to fetch price for the user.");
    }
};
exports.getPriceForNextOrder = getPriceForNextOrder;
const updatePlaceOrder = async (id, placeOrderData) => {
    const { price, description, status, method } = placeOrderData;
    const currentOrderSql = `SELECT price, user_id FROM payments WHERE id = ?`;
    try {
        const [currentOrderRows] = await databaseConnection_1.db
            .promise()
            .query(currentOrderSql, [id]);
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
        const [result] = await databaseConnection_1.db
            .promise()
            .query(sql, [price, description, status, method, id]);
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
const insertIntoOrderPayment = async (userId, paymentId) => {
    const orderSql = `
    UPDATE orders
    SET payment_id = ?, updated_at = NOW()
    WHERE user_id = ? AND order_status_id = 1;
  `;
    const orderValues = [paymentId, userId];
    try {
        const [result] = await databaseConnection_1.db
            .promise()
            .query(orderSql, orderValues);
        if (result.affectedRows === 0) {
            throw new Error("No active order found for the user to update.");
        }
    }
    catch (error) {
        console.error("SQL Error in insertIntoOrderPayment:", error);
        throw new Error("Failed to update order with payment details.");
    }
};
exports.insertIntoOrderPayment = insertIntoOrderPayment;
const deductFromWalletBalance = async (userId, amount) => {
    const sql = `
    UPDATE wallet_balances 
    SET balance = balance - ? 
    WHERE user_id = ?;
  `;
    try {
        const [result] = await databaseConnection_1.db
            .promise()
            .query(sql, [amount, userId]);
        if (result.affectedRows === 0) {
            throw new Error("Wallet balance not found for the user.");
        }
        return true;
    }
    catch (error) {
        console.error("Error updating wallet balance:", error);
        return false;
    }
};
exports.deductFromWalletBalance = deductFromWalletBalance;
// The deleteAllCartItemsByUserId
const deleteAllCartItemsByUserId = async (userId) => {
    const sql = `
    DELETE FROM carts 
    WHERE user_id = ?;
  `;
    try {
        await databaseConnection_1.db.promise().query(sql, [userId]);
    }
    catch (error) {
        console.error("Error clearing cart:", error);
        throw new Error("Failed to clear cart items.");
    }
};
exports.deleteAllCartItemsByUserId = deleteAllCartItemsByUserId;
// Fetch a place order by ID
const getPlaceOrderById = async (orderId) => {
    const sql = `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.order_type,
      o.order_date,
      o.route_id,
      o.hub_id AS order_Hub_id,
      o.locality_id AS order_locality_id,
      o.delivery_boy_id,
      o.order_status_id,
      o.tax,
      o.delivery_fee,
      o.hint,
      o.active,
      o.driver_id,
      o.delivery_address_id,
      o.payment_id,
      o.is_wallet_deduct,
      o.delivery_status,
      o.created_at AS order_created_at,
      o.updated_at AS order_updated_at,

      p.id AS payment_id,
      p.price AS payment_price,
      p.description AS payment_description,
      p.status AS payment_status,
      p.method AS payment_method,
      p.created_at AS payment_created_at,
      p.updated_at AS payment_updated_at,

      os.status AS order_status,

      ol.id AS order_log_id,
      ol.order_date AS order_log_date,
      ol.user_id AS order_log_user_id,
      ol.order_id AS order_log_order_id,
      ol.product_id AS order_log_product_id,
      ol.locality_id AS order_log_locality_id,
      ol.delivery_boy_id AS order_log_delivery_boy_id,
      ol.is_created AS order_log_is_created,
      ol.logs AS order_log_logs,
      ol.created_at AS order_log_created_at,
      ol.updated_at AS order_log_updated_at,

      oc.id AS order_combo_id,
      oc.price AS combo_price,
      oc.quantity AS combo_quantity,
      oc.combo_id AS combo_id,
      oc.order_id AS combo_order_id,
      oc.created_at AS combo_created_at,
      oc.updated_at AS combo_updated_at,

      ocd.id AS order_combo_detail_id,
      ocd.order_combo_id AS ocd_order_combo_id,
      ocd.order_id AS ocd_order_id,
      ocd.product_id AS ocd_product_id,
      ocd.created_at AS detail_created_at,
      ocd.updated_at AS detail_updated_at,

      f.id AS food_id,
      f.name AS food_name,
      f.price AS food_price,
      f.discount_price,
      f.description AS food_description,
      f.perma_link,
      f.ingredients,
      f.package_items_count,
      f.weight,
      f.unit,
      f.sku_code,
      f.barcode,
      f.cgst,
      f.sgst,
      f.subscription_type,
      f.track_inventory,
      f.featured,
      f.deliverable,
      f.restaurant_id,
      f.category_id,
      f.subcategory_id,
      f.product_type_id,
      f.hub_id,
      f.locality_id,
      f.product_brand_id,
      f.weightage,
      f.status,
      f.created_at AS food_created_at,
      f.updated_at AS food_updated_at,
      f.food_locality
    FROM orders o
    LEFT JOIN payments p ON o.payment_id = p.id
    LEFT JOIN order_logs ol ON o.id = ol.order_id
    LEFT JOIN foods f ON ol.product_id = f.id
    LEFT JOIN order_statuses os ON o.order_status_id = os.id
    LEFT JOIN order_combos oc ON o.id = oc.order_id
    LEFT JOIN order_combo_details ocd ON oc.id = ocd.order_combo_id
    WHERE o.id = ?;
  `;
    try {
        const [rows] = await databaseConnection_1.db
            .promise()
            .query(sql, [orderId]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        const placeOrder = {
            order_id: row.order_id,
            user_id: row.user_id,
            order_date: row.order_date,
            created_at: row.order_created_at,
            order_type: row.order_type,
            route_id: row.route_id,
            hub_id: row.order_Hub_id,
            locality_id: row.order_locality_id,
            delivery_boy_id: row.delivery_boy_id,
            order_status_id: row.order_status_id,
            tax: row.tax,
            delivery_fee: row.delivery_fee,
            hint: row.hint,
            active: row.active,
            driver_id: row.driver_id,
            delivery_address_id: row.delivery_address_id,
            payment_id: row.payment_id,
            is_wallet_deduct: row.is_wallet_deduct,
            delivery_status: row.delivery_status,
            updated_at: row.order_updated_at,
            status: row.order_status,
            order_logs: [],
            order_combos: [],
            food_items: [],
            payment: {
                id: row.payment_id,
                price: row.payment_price,
                description: row.payment_description,
                status: row.payment_status,
                method: row.payment_method,
                created_at: row.payment_created_at,
                updated_at: row.payment_updated_at,
            },
        };
        // Populate order logs
        placeOrder.order_logs.push({
            id: row.order_log_id,
            order_date: row.order_log_date,
            user_id: row.order_log_user_id,
            order_id: row.order_log_order_id,
            product_id: row.order_log_product_id,
            locality_id: row.order_log_locality_id,
            delivery_boy_id: row.delivery_boy_id,
            is_created: row.order_log_is_created,
            logs: row.order_log_logs,
            created_at: row.order_log_created_at,
            updated_at: row.order_log_updated_at,
        });
        // Populate order combos
        if (row.order_combo_id) {
            placeOrder.order_combos.push({
                id: row.order_combo_id,
                price: row.combo_price,
                quantity: row.combo_quantity,
                combo_id: row.combo_id,
                order_id: row.combo_order_id,
                created_at: row.combo_created_at,
                updated_at: row.combo_updated_at,
            });
        }
        // Populate food items
        if (row.food_id) {
            placeOrder.food_items.push({
                id: row.food_id,
                name: row.food_name,
                price: row.food_price,
                discount_price: row.discount_price,
                description: row.food_description
                    ? row.food_description.replace(/<\/?[^>]+(>|$)/g, "")
                    : null,
                perma_link: row.perma_link,
                ingredients: row.ingredients,
                package_items_count: row.package_items_count,
                weight: row.weight,
                unit: row.unit,
                sku_code: row.sku_code,
                barcode: row.barcode,
                cgst: row.cgst,
                sgst: row.sgst,
                subscription_type: row.subscription_type,
                track_inventory: row.track_inventory,
                featured: row.featured,
                deliverable: row.deliverable,
                restaurant_id: row.restaurant_id,
                category_id: row.category_id,
                subcategory_id: row.subcategory_id,
                product_type_id: row.product_type_id,
                hub_id: row.hub_id,
                locality_id: row.locality_id,
                product_brand_id: row.product_brand_id,
                weightage: row.weightage,
                status: row.status,
                created_at: row.food_created_at,
                updated_at: row.food_updated_at,
                food_locality: row.food_locality,
            });
        }
        // Calculate total price of items
        placeOrder.totalPriceItem = placeOrder.food_items.reduce((total, foodItem) => {
            const itemPrice = foodItem.discount_price || foodItem.price;
            return total + itemPrice;
        }, 0);
        return placeOrder;
    }
    catch (error) {
        console.error("SQL Error:", error);
        throw new Error("Failed to fetch place order by ID.");
    }
};
exports.getPlaceOrderById = getPlaceOrderById;
const getCartItemsByUserId = async (userId) => {
    const query = `
    SELECT 
      c.created_at AS created_at,
      c.id AS cart_id, 
      c.food_id, 
      c.user_id, 
      c.quantity, 
      c.updated_at,
      f.id AS food_id,
      f.name AS food_name,
      f.price,
      f.discount_price,
      f.description,
      f.perma_link,
      f.ingredients,
      f.package_items_count,
      f.weight,
      f.unit,
      f.sku_code,
      f.barcode,
      f.cgst,
      f.sgst,
      f.track_inventory,
      f.featured,
      f.deliverable,
      f.restaurant_id,
      f.category_id,
      f.subcategory_id,
      f.product_type_id,
      f.hub_id,
      f.locality_id,
      f.product_brand_id,
      f.weightage,
      f.status,
      f.food_locality
    FROM 
      carts c
    JOIN 
      foods f ON c.food_id = f.id
    WHERE 
      c.user_id = ?
    ORDER BY c.created_at DESC

  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, [userId]);
    return rows.map((row) => ({
        id: row.cart_id,
        food_id: row.food_id,
        user_id: row.user_id,
        quantity: row.quantity,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        food: {
            id: row.food_id,
            name: row.food_name,
            price: row.price,
            discountPrice: row.discount_price,
            description: row.description
                ? row.description.replace(/<\/?[^>]+(>|$)/g, "")
                : null,
            permaLink: row.perma_link,
            ingredients: row.ingredients,
            packageItemsCount: row.package_items_count,
            weight: row.weight,
            unit: row.unit,
            skuCode: row.sku_code,
            barcode: row.barcode,
            cgst: row.cgst,
            sgst: row.sgst,
            trackInventory: row.track_inventory,
            featured: row.featured,
            deliverable: row.deliverable,
            restaurantId: row.restaurant_id,
            categoryId: row.category_id,
            subcategoryId: row.subcategory_id,
            productTypeId: row.product_type_id,
            hubId: row.hub_id,
            localityId: row.locality_id,
            productBrandId: row.product_brand_id,
            weightage: row.weightage,
            status: row.status,
            foodLocality: row.food_locality,
        },
    }));
};
exports.getCartItemsByUserId = getCartItemsByUserId;
