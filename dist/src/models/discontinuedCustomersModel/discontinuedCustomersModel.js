"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscontinuedCustomersCount = exports.getDiscontinuedCustomers = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getDiscontinuedCustomers = async (limit, offset, sortField, sortOrder, searchTerm) => {
    const validSortFields = [
        "name",
        "phone",
        "email",
        "complete_address",
        "house_no",
        "wallet_balance",
        "last_order_date",
        "is_pause_subscription",
        "status",
    ];
    const orderBy = validSortFields.includes(sortField) ? sortField : "name";
    const orderDirection = sortOrder === "desc" ? "desc" : "asc";
    let query = `
    SELECT 
      u.id AS user_id, 
      u.name, 
      u.email, 
      u.phone, 
      u.status, 
      us.is_pause_subscription,
      wb.balance AS wallet_balance, 
      wb.created_at AS wallet_created_at,
      da.id AS address_id,
      da.description,
      da.address,
      da.latitude,
      da.longitude,
      da.house_no,
      da.complete_address,
      da.is_approve,
      da.is_default,
      da.locality_id AS da_locality_id,
      da.created_at AS address_created_at,
      da.updated_at AS address_updated_at,
      MAX(CONVERT_TZ(o.order_date, '+00:00', '+05:30')) AS last_order_date
    FROM 
      users u
    JOIN 
      user_subscriptions us ON u.id = us.user_id
    LEFT JOIN 
      wallet_balances wb ON u.id = wb.user_id
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
    LEFT JOIN 
      orders o ON u.id = o.user_id
    WHERE 
      (
        (us.is_pause_subscription = 1 AND us.updated_at >= CURDATE() - INTERVAL 7 DAY)
        OR
        (wb.balance <= 0 AND wb.created_at >= CURDATE() - INTERVAL 7 DAY)
      )
  `;
    const params = [];
    const subscriptionStatus = mapSubscriptionStatus(searchTerm);
    if (subscriptionStatus !== -1) {
        query += ` AND us.is_pause_subscription = ?`;
        params.push(subscriptionStatus);
    }
    else {
        query += ` AND (
        u.name LIKE ? OR
        u.phone LIKE ? OR
        u.email LIKE ? OR
        da.complete_address LIKE ? OR
        da.house_no LIKE ? OR
        wb.balance LIKE ?
      )`;
        const searchValue = `%${searchTerm}%`;
        params.push(searchValue, searchValue, searchValue, searchValue, searchValue, searchValue);
    }
    query += `
    GROUP BY 
      u.id, us.is_pause_subscription, wb.balance, wb.created_at, 
      da.id, da.description, da.address, da.latitude, da.longitude, 
      da.house_no, da.complete_address, da.is_approve, da.is_default, 
      da.locality_id, da.created_at, da.updated_at
    ORDER BY ${orderBy} ${orderDirection}
    LIMIT ? OFFSET ?;
  `;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, params);
    return rows.map((row) => ({
        user_id: row.user_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        is_pause_subscription: row.is_pause_subscription,
        wallet_balance: row.wallet_balance,
        wallet_created_at: row.wallet_created_at,
        last_order_date: row.last_order_date,
        address: {
            address_id: row.address_id,
            description: row.description,
            address: row.address,
            latitude: row.latitude,
            longitude: row.longitude,
            house_no: row.house_no,
            complete_address: row.complete_address,
            is_approve: row.is_approve,
            is_default: row.is_default,
            locality_id: row.da_locality_id,
            created_at: row.address_created_at,
            updated_at: row.address_updated_at,
        },
    }));
};
exports.getDiscontinuedCustomers = getDiscontinuedCustomers;
const mapSubscriptionStatus = (searchTerm) => {
    const subscriptionStatusMap = {
        Paused: 1,
        Active: 0,
    };
    const matchedKey = Object.keys(subscriptionStatusMap).find((key) => key.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchedKey ? subscriptionStatusMap[matchedKey] : -1;
};
const getDiscontinuedCustomersCount = async () => {
    const query = `
    SELECT COUNT(*) AS total_count
    FROM 
      users u
    JOIN 
      user_subscriptions us ON u.id = us.user_id
    LEFT JOIN 
      wallet_balances wb ON u.id = wb.user_id
    WHERE 
      (us.is_pause_subscription = 1 AND us.updated_at >= CURDATE() - INTERVAL 7 DAY)
      OR
      (wb.balance <= 0 AND wb.created_at >= CURDATE() - INTERVAL 7 DAY);
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query);
    return rows[0].total_count;
};
exports.getDiscontinuedCustomersCount = getDiscontinuedCustomersCount;
