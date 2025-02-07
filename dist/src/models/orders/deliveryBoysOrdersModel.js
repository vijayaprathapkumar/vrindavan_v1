"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDeliveryBoyOrders = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all delivery boy orders with complete user data
const getAllDeliveryBoyOrders = async (page, limit, searchTerm, localityId, foodName, startDate, endDate) => {
    try {
        const offset = (page - 1) * limit;
        // Build search conditions
        const searchCondition = searchTerm
            ? `
      AND (
        u.name LIKE ? OR
        u.phone LIKE ? OR
        u.email LIKE ? OR
        l.name LIKE ? OR
        f.name LIKE ?
      )`
            : "";
        const localityCondition = localityId ? `AND l.id = ?` : "";
        const foodNameCondition = foodName ? `AND f.name LIKE ?` : "";
        const dateCondition = startDate && endDate ? `AND o.created_at BETWEEN ? AND ?` : "";
        const searchValue = `%${searchTerm}%`;
        const foodNameValue = `%${foodName}%`;
        // Construct the query with all conditions
        const [rows] = await databaseConnection_1.db.promise().query(`
      SELECT
        o.id AS order_id,
        o.user_id AS order_user_id,
        o.route_id AS order_route_id,
        o.hub_id AS order_hub_id,
        o.locality_id AS order_locality_id,
        o.delivery_boy_id AS order_delivery_boy_id,
        o.order_status_id AS order_status_id,
        o.tax AS order_tax,
        o.delivery_fee AS order_delivery_fee,
        o.active AS order_active,
        o.driver_id AS order_driver_id,
        o.delivery_address_id AS order_delivery_address_id,
        o.payment_id AS order_payment_id,
        o.is_wallet_deduct AS order_is_wallet_deduct,
        o.delivery_status AS order_delivery_status,
        o.created_at AS order_created_at,
        o.updated_at AS order_updated_at,
        f.id AS food_id,
        f.name AS food_name,
        f.price AS food_price,
        f.discount_price AS food_discount_price,
        f.description AS food_description,
        f.perma_link AS food_perma_link,
        f.unit AS food_unit,
        fo.quantity AS food_quantity,
        fo.price AS food_price,
        f.created_at AS food_created_at,
        f.updated_at AS food_updated_at,
        l.id AS locality_id,
        l.route_id AS locality_route_id,
        l.hub_id AS locality_hub_id,
        l.name AS locality_name,
        l.address AS locality_address,
        l.google_address AS locality_google_address,
        l.latitude AS locality_latitude,
        l.longitude AS locality_longitude,
        l.city AS locality_city,
        p.id AS payment_id,
        p.price AS payment_price,
        p.description AS payment_description,
        p.user_id AS payment_user_id,
        p.status AS payment_status,
        p.method AS payment_method,
        p.created_at AS payment_created_at,
        p.updated_at AS payment_updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        u.api_token AS user_api_token,
        u.device_token AS user_device_token,
        u.delivery_priority AS user_delivery_priority,
        u.credit_limit AS user_credit_limit,
        da.id AS delivery_address_id,
        da.description AS delivery_address_description,
        da.address AS delivery_address_address,
        da.latitude AS delivery_address_latitude,
        da.longitude AS delivery_address_longitude,
        da.house_no AS delivery_address_house_no,
        da.complete_address AS delivery_address_complete_address,
        db.id AS delivery_boy_id,
        db.name AS delivery_boy_name,
        db.mobile AS delivery_boy_mobile,
        db.user_id AS delivery_boy_user_id,
        db.active AS delivery_boy_active,
        db.cash_collection AS delivery_boy_cash_collection,
        db.delivery_fee AS delivery_boy_delivery_fee,
        db.total_orders AS delivery_boy_total_orders,
        db.earning AS delivery_boy_earning,
        db.available AS delivery_boy_available,
        db.addressPickup AS delivery_boy_addressPickup,
        db.latitudePickup AS delivery_boy_latitudePickup,
        db.longitudePickup AS delivery_boy_longitudePickup,
        db.created_at AS delivery_boy_created_at,
        db.updated_at AS delivery_boy_updated_at,
        ldb.id AS locality_delivery_boy_id,
        ldb.locality_id AS locality_delivery_boy_locality_id,
        ldb.delivery_boy_id AS locality_delivery_boy_delivery_boy_id,
        ldb.created_at AS locality_delivery_boy_created_at,
        ldb.updated_at AS locality_delivery_boy_updated_at
      FROM orders o
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      LEFT JOIN localities l ON o.locality_id = l.id
      LEFT JOIN payments p ON o.payment_id = p.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
      LEFT JOIN locality_delivery_boys ldb ON o.locality_id = ldb.locality_id
      LEFT JOIN delivery_boys db ON ldb.delivery_boy_id = db.id
      WHERE 1=1
      ${searchCondition}
      ${localityCondition}
      ${foodNameCondition}
      ${dateCondition}
       ORDER BY o.created_at DESC, f.id
      LIMIT ? OFFSET ?;
    `, [
            ...(searchTerm
                ? [searchValue, searchValue, searchValue, searchValue, searchValue]
                : []),
            ...(localityId ? [localityId] : []),
            ...(foodName ? [foodNameValue] : []),
            ...(startDate && endDate ? [startDate, endDate] : []),
            limit,
            offset,
        ]);
        // Fetch total count with filters including delivery_boys association
        const [[{ totalRecords }]] = await databaseConnection_1.db.promise().query(`
      SELECT COUNT(*) AS totalRecords
      FROM orders o
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      LEFT JOIN localities l ON o.locality_id = l.id
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN locality_delivery_boys ldb ON o.locality_id = ldb.locality_id
      LEFT JOIN delivery_boys db ON ldb.delivery_boy_id = db.id
      WHERE 1=1
      ${searchCondition}
      ${localityCondition}
      ${foodNameCondition}
      ${dateCondition};
    `, [
            ...(searchTerm
                ? [searchValue, searchValue, searchValue, searchValue, searchValue]
                : []),
            ...(localityId ? [localityId] : []),
            ...(foodName ? [foodNameValue] : []),
            ...(startDate && endDate ? [startDate, endDate] : []),
        ]);
        // Structuring data logic remains the same
        const structuredData = rows.reduce((acc, row) => {
            let order = acc.find((order) => order.order_id === row.order_id);
            if (!order) {
                order = {
                    order_id: row.order_id,
                    user: {
                        id: row.user_id,
                        name: row.user_name,
                        phone: row.user_phone,
                        email: row.user_email,
                        api_token: row.user_api_token,
                        device_token: row.user_device_token,
                        delivery_priority: row.user_delivery_priority,
                        credit_limit: row.user_credit_limit,
                    },
                    delivery_address: row.delivery_address_id
                        ? {
                            id: row.delivery_address_id,
                            description: row.delivery_address_description,
                            address: row.delivery_address_address,
                            latitude: row.delivery_address_latitude,
                            longitude: row.delivery_address_longitude,
                            house_no: row.delivery_address_house_no,
                            complete_address: row.delivery_address_complete_address,
                        }
                        : null,
                    locality: {
                        id: row.locality_id,
                        name: row.locality_name,
                        address: row.locality_address,
                        google_address: row.locality_google_address,
                        latitude: row.locality_latitude,
                        longitude: row.locality_longitude,
                        city: row.locality_city,
                    },
                    delivery_boy: {
                        id: row.delivery_boy_id,
                        name: row.delivery_boy_name,
                        mobile: row.delivery_boy_mobile,
                        user_id: row.delivery_boy_user_id,
                        active: row.delivery_boy_active,
                        cash_collection: row.delivery_boy_cash_collection,
                        delivery_fee: row.delivery_boy_delivery_fee,
                        total_orders: row.delivery_boy_total_orders,
                        earning: row.delivery_boy_earning,
                        available: row.delivery_boy_available,
                        addressPickup: row.delivery_boy_addressPickup,
                        latitudePickup: row.delivery_boy_latitudePickup,
                        longitudePickup: row.delivery_boy_longitudePickup,
                        created_at: row.delivery_boy_created_at,
                        updated_at: row.delivery_boy_updated_at,
                    },
                    locality_delivery_boys: {
                        id: row.locality_delivery_boy_id,
                        locality_id: row.locality_delivery_boy_locality_id,
                        delivery_boy_id: row.locality_delivery_boy_delivery_boy_id,
                        created_at: row.locality_delivery_boy_created_at,
                        updated_at: row.locality_delivery_boy_updated_at,
                    },
                    payment: {
                        id: row.payment_id,
                        price: row.payment_price,
                        description: row.payment_description,
                        status: row.payment_status,
                        method: row.payment_method,
                    },
                    created_at: row.order_created_at,
                    updated_at: row.order_updated_at,
                    foods: [],
                };
                acc.push(order);
            }
            if (row.food_id &&
                !order.foods.some((food) => food.id === row.food_id)) {
                order.foods.push({
                    id: row.food_id,
                    name: row.food_name,
                    unit: row.food_unit,
                    quantity: row.food_quantity,
                    price: row.food_price,
                    created_at: row.food_created_at, // Adding created_at for food
                    updated_at: row.food_updated_at, // Adding updated_at for food
                    product_type: {
                        name: row.product_type_name,
                        weightage: row.product_type_weightage,
                    },
                });
            }
            return acc;
        }, []);
        return { data: structuredData, totalRecords };
    }
    catch (error) {
        console.error("Error fetching orders with users and other details:", error);
        throw error;
    }
};
exports.getAllDeliveryBoyOrders = getAllDeliveryBoyOrders;
