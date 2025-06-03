"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerById = exports.updateCustomerById = exports.getCustomerById = exports.createCustomer = exports.getAllCustomers = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllCustomers = async (page, limit, locality, status, searchTerm, sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    // Base query for both main data and count
    let baseQuery = `
    WITH RankedUsers AS (
      SELECT 
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        u.phone,
        u.api_token,
        u.device_token,
        u.delivery_priority,
        u.credit_limit,
        u.stripe_id,
        u.card_brand,
        u.card_last_four,
        u.trial_ends_at,
        u.braintree_id,
        u.paypal_email,
        u.remember_token,
        u.status,
        u.is_deactivated,
        u.is_deactivated_at,
        u.created_at,
        u.updated_at,
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
        l.id AS locality_id,
        l.name AS locality_name,
        wb.balance AS wallet_balance,
        lb.delivery_boy_id,
        db.name AS delivery_boy_name,
        db.mobile AS delivery_boy_mobile,
        db.active AS delivery_boy_active,
        db.cash_collection AS delivery_boy_cash_collection,
        db.delivery_fee AS delivery_boy_fee,
        db.total_orders AS delivery_boy_orders,
        db.earning AS delivery_boy_earning,
        db.available AS delivery_boy_available,
        ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY u.created_at DESC) AS row_num
      FROM 
        users u
      LEFT JOIN 
        delivery_addresses da ON u.id = da.user_id
      LEFT JOIN 
        localities l ON da.locality_id = l.id
      LEFT JOIN 
        wallet_balances wb ON u.id = wb.user_id
      LEFT JOIN 
        locality_delivery_boys lb ON lb.locality_id = da.locality_id
      LEFT JOIN 
        delivery_boys db ON lb.delivery_boy_id = db.id
      WHERE 1=1
  `;
    const params = [];
    const countParams = [];
    // Apply filters to both queries
    if (searchTerm) {
        const searchValue = `%${searchTerm}%`;
        baseQuery += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.id LIKE ? `;
        if (searchTerm.toLowerCase() === "active") {
            baseQuery += ` OR u.status = 1 `;
        }
        else if (searchTerm.toLowerCase() === "inactive") {
            baseQuery += ` OR u.status = 0 `;
        }
        baseQuery += `) `;
        params.push(searchValue, searchValue, searchValue, searchValue);
        countParams.push(...params.slice(-4)); // Add same params to count query
    }
    if (locality && locality !== "All") {
        baseQuery += ` AND l.id = ? `;
        params.push(parseInt(locality));
        countParams.push(parseInt(locality));
    }
    if (status && status !== "All") {
        baseQuery += ` AND u.status = ? `;
        params.push(status);
        countParams.push(status);
    }
    // Main data query
    let dataQuery = baseQuery + `
    )
    SELECT *
    FROM RankedUsers
    WHERE row_num = 1
  `;
    // Apply sorting only to data query
    const validSortFields = {
        user_id: "user_id",
        user_name: "user_name",
        status: "status",
        email: "email",
        phone: "phone",
        created_at: "created_at",
    };
    if (sortField && validSortFields[sortField]) {
        const order = sortOrder === "desc" ? "desc" : "asc";
        if (sortField === "status") {
            dataQuery += ` ORDER BY CAST(${validSortFields[sortField]} AS CHAR) ${order}`;
        }
        else {
            dataQuery += ` ORDER BY ${validSortFields[sortField]} ${order}`;
        }
    }
    else {
        dataQuery += " ORDER BY user_id desc";
    }
    dataQuery += ` LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    // Execute main query
    const [rows] = await databaseConnection_1.db.promise().query(dataQuery, params);
    // Count query - uses the same filters but without pagination
    const countQuery = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM users u
    LEFT JOIN delivery_addresses da ON u.id = da.user_id
    LEFT JOIN localities l ON da.locality_id = l.id
    WHERE 1=1
    ${searchTerm ? 'AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.id LIKE ?' +
        (searchTerm.toLowerCase() === "active" ? ' OR u.status = 1' : '') +
        (searchTerm.toLowerCase() === "inactive" ? ' OR u.status = 0' : '') + ')' : ''}
    ${locality && locality !== "All" ? 'AND l.id = ?' : ''}
    ${status && status !== "All" ? 'AND u.status = ?' : ''}
  `;
    const [[totalCount]] = await databaseConnection_1.db
        .promise()
        .query(countQuery, countParams);
    // Status count query remains the same
    const statusCountQuery = `
    SELECT 
      SUM(status = '0') AS status_0_count,
      SUM(status = '1') AS status_1_count,
      SUM(status = '2') AS status_2_count
    FROM users;
  `;
    const [[statusCount]] = await databaseConnection_1.db
        .promise()
        .query(statusCountQuery);
    return {
        customers: rows.map((row) => ({
            user_id: row.user_id,
            user_name: row.user_name,
            email: row.email,
            phone: row.phone,
            api_token: row.api_token,
            device_token: row.device_token,
            delivery_priority: row.delivery_priority,
            credit_limit: row.credit_limit,
            stripe_id: row.stripe_id,
            card_brand: row.card_brand,
            card_last_four: row.card_last_four,
            trial_ends_at: row.trial_ends_at,
            braintree_id: row.braintree_id,
            paypal_email: row.paypal_email,
            remember_token: row.remember_token,
            status: row.status,
            is_deactivated: row.is_deactivated,
            is_deactivated_at: row.is_deactivated_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            wallet_balance: row.wallet_balance,
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
                locality_name: row.locality_name,
                created_at: row.address_created_at,
                updated_at: row.address_updated_at,
            },
            delivery_boy: {
                delivery_boy_id: row.delivery_boy_id,
                name: row.delivery_boy_name,
                mobile: row.delivery_boy_mobile,
                active: row.delivery_boy_active,
                cash_collection: row.delivery_boy_cash_collection,
                delivery_fee: row.delivery_boy_fee,
                total_orders: row.delivery_boy_orders,
                earning: row.delivery_boy_earning,
                available: row.delivery_boy_available,
            },
        })),
        total: totalCount.total,
        statusCount,
    };
};
exports.getAllCustomers = getAllCustomers;
const createCustomer = async (localityId, name, email, mobile, houseNo, completeAddress, status, password) => {
    if (!localityId || !name || !email || !mobile || !houseNo) {
        throw new Error("All fields are required.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error("Invalid email format.");
    }
    // Remove +91 from mobile number if it exists
    const cleanedMobile = mobile.replace(/^\+91/, "").trim();
    try {
        // Check for existing user
        const existingUserQuery = "SELECT email, phone FROM users WHERE email = ? OR phone = ?";
        const [existingUsers] = await databaseConnection_1.db
            .promise()
            .query(existingUserQuery, [email, cleanedMobile]);
        if (existingUsers.length > 0) {
            if (existingUsers.some((user) => user.email === email)) {
                return null; // Email already registered
            }
            if (existingUsers.some((user) => user.phone === cleanedMobile)) {
                return 0; // Mobile already registered
            }
        }
        // Insert new user
        const insertUserQuery = "INSERT INTO users (name, email, phone, status, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())";
        const [userResult] = await databaseConnection_1.db
            .promise()
            .query(insertUserQuery, [
            name,
            email,
            cleanedMobile,
            status || "active",
            password || "",
        ]);
        const userId = userResult.insertId;
        // Insert user address
        const insertAddressQuery = "INSERT INTO delivery_addresses (user_id, locality_id, house_no, complete_address, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())";
        await databaseConnection_1.db
            .promise()
            .query(insertAddressQuery, [
            userId,
            localityId,
            houseNo,
            completeAddress,
        ]);
        // Insert wallet balance
        const insertWalletQuery = "INSERT INTO wallet_balances (user_id, balance, created_at, updated_at) VALUES (?, 0, NOW(), NOW())";
        await databaseConnection_1.db.promise().query(insertWalletQuery, [userId]);
        return userId;
    }
    catch (error) {
        console.error("Error creating customer:", error);
        throw new Error("Error creating customer: " + (error.message || "Unknown error"));
    }
};
exports.createCustomer = createCustomer;
// Fetch customer by ID
const getCustomerById = async (id) => {
    const query = `
    SELECT 
      u.id AS user_id,
      u.name AS user_name,
      u.email,
      u.phone,
      u.api_token,
      u.device_token,
      u.delivery_priority,
      u.credit_limit,
      u.stripe_id,
      u.card_brand,
      u.card_last_four,
      u.trial_ends_at,
      u.braintree_id,
      u.paypal_email,
      u.remember_token,
      u.status,
      u.is_deactivated,
      u.is_deactivated_at,
      u.created_at,
      u.updated_at,
      da.id AS address_id,
      da.description,
      da.address,
      da.latitude,
      da.longitude,
      da.house_no,
      da.complete_address,
      da.is_approve,
      da.is_default,
      da.locality_id,
      da.created_at AS address_created_at,
      da.updated_at AS address_updated_at,
      l.id AS locality_id,
      l.name AS locality_name,
      wb.balance AS wallet_balance,
      lb.delivery_boy_id,
      db.name AS delivery_boy_name,
      db.mobile AS delivery_boy_mobile,
      db.active AS delivery_boy_active,
      db.cash_collection AS delivery_boy_cash_collection,
      db.delivery_fee AS delivery_boy_fee,
      db.total_orders AS delivery_boy_orders,
      db.earning AS delivery_boy_earning,
      db.available AS delivery_boy_available
    FROM 
      users u
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
    LEFT JOIN 
      localities l ON da.locality_id = l.id
    LEFT JOIN 
      wallet_balances wb ON u.id = wb.user_id
    LEFT JOIN 
      locality_delivery_boys lb ON lb.locality_id = da.locality_id
    LEFT JOIN 
      delivery_boys db ON lb.delivery_boy_id = db.id
    WHERE 
      u.id = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    return {
        user_id: row.user_id,
        user_name: row.user_name,
        email: row.email,
        phone: row.phone,
        api_token: row.api_token,
        device_token: row.device_token,
        delivery_priority: row.delivery_priority,
        credit_limit: row.credit_limit,
        stripe_id: row.stripe_id,
        card_brand: row.card_brand,
        card_last_four: row.card_last_four,
        trial_ends_at: row.trial_ends_at,
        braintree_id: row.braintree_id,
        remember_token: row.remember_token,
        status: row.status,
        is_deactivated: row.is_deactivated,
        is_deactivated_at: row.is_deactivated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        wallet_balance: row.wallet_balance ?? "0.00",
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
            locality_id: row.locality_id,
            locality_name: row.locality_name,
        },
        delivery_boy: {
            delivery_boy_id: row.delivery_boy_id,
            name: row.delivery_boy_name,
            mobile: row.delivery_boy_mobile,
            active: row.delivery_boy_active,
            cash_collection: row.delivery_boy_cash_collection,
            delivery_fee: row.delivery_boy_fee,
            total_orders: row.delivery_boy_orders,
            earning: row.delivery_boy_earning,
            available: row.delivery_boy_available,
        },
        custom_fields: rows.map((row) => ({
            custom_field_id: row.custom_field_id,
            custom_field_name: row.custom_field_name,
        })),
        priority: {
            priority_id: row.priority_id,
            mark_priority: row.mark_priority,
        },
    };
};
exports.getCustomerById = getCustomerById;
const updateCustomerById = async (id, localityId, name, email, mobile, houseNo, completeAddress, status) => {
    try {
        const existingUserQuery = `SELECT id FROM users WHERE email = ?;`;
        const [existingUsers] = await databaseConnection_1.db
            .promise()
            .query(existingUserQuery, [email]);
        if (existingUsers.length === 0) {
            return null;
        }
        const updateUserQuery = `
      UPDATE users SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      status = COALESCE(?, status),
      updated_at = NOW()
      WHERE id = ?;
    `;
        await databaseConnection_1.db
            .promise()
            .query(updateUserQuery, [name, email, mobile, status, id]);
        const updateAddressQuery = `
      UPDATE delivery_addresses SET
      locality_id = COALESCE(?, locality_id),
      house_no = COALESCE(?, house_no),
      complete_address = COALESCE(?, complete_address),
      updated_at = NOW()
      WHERE user_id = ?;
    `;
        await databaseConnection_1.db
            .promise()
            .query(updateAddressQuery, [
            localityId,
            houseNo,
            completeAddress,
            id,
        ]);
    }
    catch (error) {
        console.error("Error updating customer:", error.message);
        throw new Error("Error updating customer: " + error.message);
    }
};
exports.updateCustomerById = updateCustomerById;
const deleteCustomerById = async (customerId) => {
    const connection = await databaseConnection_1.db.promise().getConnection();
    await connection.beginTransaction();
    try {
        await connection.query("DELETE FROM delivery_addresses WHERE user_id = ?", [customerId]);
        await connection.query("DELETE FROM users WHERE id = ?", [
            customerId,
        ]);
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        await connection.release();
    }
};
exports.deleteCustomerById = deleteCustomerById;
