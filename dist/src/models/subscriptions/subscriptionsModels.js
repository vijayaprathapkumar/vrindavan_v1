"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionPauseInfo = exports.getSubscriptionGetByIdModel = exports.updateCancelSubscriptionModel = exports.resumeSubscriptionModel = exports.pauseSubscriptionModel = exports.deleteSubscriptionModel = exports.updateSubscriptionModel = exports.getTotalSubscriptionsCountModel = exports.getAllSubscriptionsModel = exports.addSubscriptionQuantityChangeModel = exports.addSubscriptionModel = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const istTimeFomate_1 = require("../../utils/istTimeFomate");
const addSubscriptionModel = (subscription) => {
    const newSubscription = {
        ...subscription,
        end_date: "2050-12-31",
        created_at: new Date(),
        updated_at: new Date(),
    };
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("INSERT INTO user_subscriptions SET ?", [newSubscription], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.addSubscriptionModel = addSubscriptionModel;
const addSubscriptionQuantityChangeModel = (user_subscription_id, user_id, quantity, product_id, start_date, end_date, cancel_subscription, pause_subscription, order_date = null, pause_date = null, cancel_order_date = null, cancel_subscription_date = null, cancel_order = null, today_order = null, previous_order = null) => {
    return new Promise((resolve, reject) => {
        const changeData = {
            user_subscription_id,
            order_type: 2,
            user_id,
            product_id,
            quantity,
            order_date,
            start_date: start_date || null,
            end_date: end_date || null,
            cancel_subscription: cancel_subscription || null,
            pause_date: pause_subscription ? pause_date : null,
            cancel_order_date: cancel_order_date || null,
            cancel_subscription_date: cancel_subscription_date || null,
            cancel_order: cancel_order || null,
            today_order: today_order || null,
            previous_order: previous_order || null,
            pause_subscription: pause_subscription ? "1" : "0",
            reason: null,
            other_reason: null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        databaseConnection_1.db.query("INSERT INTO subscription_quantity_changes SET ?", [changeData], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.addSubscriptionQuantityChangeModel = addSubscriptionQuantityChangeModel;
const getAllSubscriptionsModel = (userId, page, limit, searchTerm, startDate, endDate) => {
    const offset = (page - 1) * limit;
    const searchQuery = searchTerm ? `%${searchTerm}%` : null;
    return new Promise((resolve, reject) => {
        let query = `
    SELECT DISTINCT
      user_subscriptions.id AS user_subscriptions_id,
      user_subscriptions.user_id,
      user_subscriptions.product_id,
      user_subscriptions.subscription_type,
      user_subscriptions.start_date,
      user_subscriptions.end_date,
      user_subscriptions.quantity,
      user_subscriptions.monday_qty,
      user_subscriptions.tuesday_qty,
      user_subscriptions.wednesday_qty,
      user_subscriptions.thursday_qty,
      user_subscriptions.friday_qty,
      user_subscriptions.saturday_qty,
      user_subscriptions.sunday_qty,
      user_subscriptions.active,
      user_subscriptions.cancel_subscription,
      user_subscriptions.created_at,
      user_subscriptions.updated_at,
      user_subscriptions.is_pause_subscription,
      user_subscriptions.pause_until_i_come_back,
      user_subscriptions.pause_specific_period_startDate,
      user_subscriptions.pause_specific_period_endDate,
      MAX(foods.id) AS food_id,
      MAX(foods.name) AS food_name,
      MAX(foods.price) AS price,
      MAX(foods.discount_price) AS discount_price,
      MAX(foods.description) AS description,
      MAX(foods.perma_link) AS perma_link,
      MAX(foods.ingredients) AS ingredients,
      MAX(foods.package_items_count) AS package_items_count,
      MAX(foods.weight) AS weight,
      MAX(foods.unit) AS unit,
      MAX(foods.sku_code) AS sku_code,
      MAX(foods.barcode) AS barcode,
      MAX(foods.cgst) AS cgst,
      MAX(foods.sgst) AS sgst,
      MAX(foods.subscription_type) AS food_subscription_type,
      MAX(foods.track_inventory) AS track_inventory,
      MAX(foods.featured) AS featured,
      MAX(foods.deliverable) AS deliverable,
      MAX(foods.restaurant_id) AS restaurant_id,
      MAX(foods.category_id) AS category_id,
      MAX(foods.subcategory_id) AS subcategory_id,
      MAX(foods.product_type_id) AS product_type_id,
      MAX(foods.hub_id) AS hub_id,
      MAX(foods.locality_id) AS locality_id,
      MAX(foods.product_brand_id) AS product_brand_id,
      MAX(foods.weightage) AS weightage,
      MAX(foods.status) AS food_status,
      MAX(foods.created_at) AS food_created_at,
      MAX(foods.updated_at) AS food_updated_at,
      MAX(foods.food_locality) AS food_locality,
      MAX(m.id) AS media_id,
      MAX(m.model_type) AS model_type,
      MAX(m.uuid) AS uuid,
      MAX(m.collection_name) AS collection_name,
      MAX(m.name) AS media_name,
      MAX(m.file_name) AS file_name,
      MAX(m.mime_type) AS mime_type,
      MAX(m.disk) AS disk,
      MAX(m.conversions_disk) AS conversions_disk,
      MAX(m.size) AS media_size,
      MAX(m.manipulations) AS manipulations,
      MAX(m.custom_properties) AS custom_properties,
      MAX(m.generated_conversions) AS generated_conversions,
      MAX(m.responsive_images) AS responsive_images,
      MAX(m.order_column) AS order_column,
      MAX(m.created_at) AS media_created_at,
      MAX(m.updated_at) AS media_updated_at,
      CASE 
        WHEN MAX(m.conversions_disk) = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', MAX(m.file_name))
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', MAX(m.id), '/', MAX(m.file_name))
      END AS original_url,
      MAX(sqc.id) AS subscription_quantity_id,
      MAX(sqc.user_subscription_id) AS subscription_quantity_user_subscription_id,
      MAX(sqc.order_type) AS subscription_quantity_order_type,
      MAX(sqc.user_id) AS sqc_user_id,
      MAX(sqc.product_id) AS subscription_quantity_product_id,
      MAX(sqc.quantity) AS subscription_quantity,
      MAX(sqc.order_date) AS order_date,
      MAX(sqc.start_date) AS subscription_start_date,
      MAX(sqc.end_date) AS subscription_end_date,
      MAX(sqc.cancel_subscription) AS cancel_subscription,
      MAX(sqc.pause_date) AS pause_date,
      MAX(sqc.cancel_order_date) AS cancel_order_date,
      MAX(sqc.cancel_subscription_date) AS cancel_subscription_date,
      MAX(sqc.cancel_order) AS cancel_order,
      MAX(sqc.today_order) AS today_order,
      MAX(sqc.previous_order) AS previous_order,
      MAX(sqc.pause_subscription) AS pause_subscription,
      MAX(sqc.reason) AS reason,
      MAX(sqc.other_reason) AS other_reason,
      MAX(sqc.created_at) AS sqc_created_at,
      MAX(sqc.updated_at) AS sqc_updated_at
    FROM user_subscriptions
    LEFT JOIN foods ON user_subscriptions.product_id = foods.id
    LEFT JOIN media m ON foods.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    LEFT JOIN subscription_quantity_changes sqc ON user_subscriptions.id = sqc.user_subscription_id
    WHERE user_subscriptions.user_id = ?
    `;
        const params = [userId];
        if (searchQuery) {
            query += ` AND (foods.name LIKE ? 
                      OR foods.unit LIKE ? 
                      OR foods.status LIKE ? 
                      OR foods.weightage LIKE ? 
                      OR foods.description LIKE ?)`;
            params.push(searchQuery, searchQuery, searchQuery, searchQuery, searchQuery);
        }
        if (startDate && endDate) {
            query += ` AND user_subscriptions.start_date >= ? AND user_subscriptions.end_date <= ? `;
            params.push(startDate.toISOString().slice(0, 19).replace("T", " "), endDate.toISOString().slice(0, 19).replace("T", " "));
        }
        query += `
      GROUP BY user_subscriptions.id
      ORDER BY user_subscriptions.created_at DESC 
      LIMIT ?, ?
    `;
        params.push(offset, limit);
        databaseConnection_1.db.query(query, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            const transformedResults = results.map((change) => ({
                ...change,
                pause_specific_period_startDate_ist: (0, istTimeFomate_1.toIST)(change.pause_specific_period_startDate),
                pause_specific_period_endDate_ist: (0, istTimeFomate_1.toIST)(change.pause_specific_period_endDate),
            }));
            resolve(transformedResults);
        });
    });
};
exports.getAllSubscriptionsModel = getAllSubscriptionsModel;
const getTotalSubscriptionsCountModel = (userId) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("SELECT COUNT(*) as count FROM user_subscriptions WHERE user_id = ?", [userId], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results[0].count);
        });
    });
};
exports.getTotalSubscriptionsCountModel = getTotalSubscriptionsCountModel;
const updateSubscriptionModel = (id, subscription) => {
    const updatedSubscription = {
        ...subscription,
        end_date: "2050-12-31",
        updated_at: new Date(),
    };
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET ? WHERE id = ?", [updatedSubscription, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.updateSubscriptionModel = updateSubscriptionModel;
const deleteSubscriptionModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("DELETE FROM user_subscriptions WHERE id = ?", [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.deleteSubscriptionModel = deleteSubscriptionModel;
const pauseSubscriptionModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET is_pause_subscription = 1, updated_at = NOW() WHERE id = ?", [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            const pauseDate = new Date();
            databaseConnection_1.db.query("UPDATE subscription_quantity_changes SET pause_subscription = 1, pause_date = ?, updated_at = NOW() WHERE user_subscription_id = ?", [pauseDate, id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};
exports.pauseSubscriptionModel = pauseSubscriptionModel;
const resumeSubscriptionModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(`UPDATE user_subscriptions
       SET 
         is_pause_subscription = 0,
         pause_until_i_come_back = 0,
         pause_specific_period_startDate = NULL,
         pause_specific_period_endDate = NULL
       WHERE id = ? AND is_pause_subscription = 1 OR pause_until_i_come_back = 1`, [id], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
};
exports.resumeSubscriptionModel = resumeSubscriptionModel;
const updateCancelSubscriptionModel = (id, cancel_subscription, cancel_subscription_date) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query("UPDATE user_subscriptions SET cancel_subscription = ?, updated_at = NOW() WHERE id = ?", [cancel_subscription, id], (error, results) => {
            if (error) {
                return reject(error);
            }
            databaseConnection_1.db.query("UPDATE subscription_quantity_changes SET cancel_subscription = ?, cancel_subscription_date = ?, updated_at = NOW() WHERE user_subscription_id = ?", [cancel_subscription, cancel_subscription_date, id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};
exports.updateCancelSubscriptionModel = updateCancelSubscriptionModel;
const getSubscriptionGetByIdModel = (id) => {
    return new Promise((resolve, reject) => {
        databaseConnection_1.db.query(`SELECT user_subscriptions.*, 
      foods.id as food_id, 
      foods.name, 
      foods.price, 
      foods.discount_price, 
      foods.description, 
      foods.perma_link, 
      foods.ingredients, 
      foods.package_items_count, 
      foods.weight, 
      foods.unit, 
      foods.sku_code, 
      foods.barcode, 
      foods.cgst, 
      foods.sgst, 
      foods.subscription_type, 
      foods.track_inventory, 
      foods.featured, 
      foods.deliverable, 
      foods.restaurant_id, 
      foods.category_id, 
      foods.subcategory_id, 
      foods.product_type_id, 
      foods.hub_id, 
      foods.locality_id, 
      foods.product_brand_id, 
      foods.weightage, 
      foods.status, 
      foods.created_at as food_created_at, 
      foods.updated_at as food_updated_at, 
      foods.food_locality,
      m.id AS media_id,
      m.model_type,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size AS media_size,
      m.manipulations,
      m.custom_properties,
      m.generated_conversions,
      m.responsive_images,
      m.order_column,
      m.created_at AS media_created_at,
      m.updated_at AS media_updated_at,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url,
       sqc.user_subscription_id,
             sqc.order_type,
             sqc.user_id,
             sqc.product_id,
             sqc.quantity AS subscription_quantity, 
             sqc.order_date,
             sqc.start_date,
             sqc.end_date,
             sqc.cancel_subscription,
             sqc.pause_date,
             sqc.cancel_order_date,
             sqc.cancel_subscription_date,
             sqc.cancel_order,
             sqc.today_order,
             sqc.previous_order,
             sqc.pause_subscription,
             sqc.reason,
             sqc.other_reason,
             sqc.created_at,
             sqc.updated_at AS quantity_updated_at 
FROM user_subscriptions
JOIN foods ON user_subscriptions.product_id = foods.id
LEFT JOIN media m ON foods.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
 LEFT JOIN subscription_quantity_changes sqc ON user_subscriptions.id = sqc.user_subscription_id 
WHERE user_subscriptions.id = ?`, [id], (error, results) => {
            if (error) {
                console.log("Query Results:", error);
                return reject(error);
            }
            console.log("Query Results:", results);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};
exports.getSubscriptionGetByIdModel = getSubscriptionGetByIdModel;
const updateSubscriptionPauseInfo = async (id, userId, isPauseSubscription, pauseUntilComeBack, startDate, endDate) => {
    const shouldPause = pauseUntilComeBack === 1 || startDate || endDate;
    isPauseSubscription = shouldPause ? 1 : 0;
    let sql = `
    UPDATE user_subscriptions 
    SET 
      is_pause_subscription = ?,
      pause_until_i_come_back = ?, 
      pause_specific_period_startDate = ?, 
      pause_specific_period_endDate = ? 
    WHERE id = ?;
  `;
    const values = [
        isPauseSubscription,
        pauseUntilComeBack || 0,
        startDate || null,
        endDate || null,
        id,
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result;
    }
    catch (error) {
        console.error("Error updating subscription pause info:", error);
        throw new Error("Failed to update subscription pause information.");
    }
};
exports.updateSubscriptionPauseInfo = updateSubscriptionPauseInfo;
