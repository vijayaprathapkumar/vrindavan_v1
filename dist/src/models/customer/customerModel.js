"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerById = exports.updateCustomerById = exports.getCustomerById = exports.createCustomer = exports.getAllCustomers = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all customers
const getAllCustomers = async (page, limit, locality, status, searchTerm, isApproved) => {
    const offset = (page - 1) * limit;
    let query = `
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
      l.name AS locality_name
    FROM 
      users u
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
    LEFT JOIN 
      localities l ON da.locality_id = l.id
    WHERE 
      u.id IS NOT NULL
  `;
    const params = [];
    if (searchTerm) {
        const searchValue = `%${searchTerm}%`;
        query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?) `;
        params.push(searchValue, searchValue, searchValue);
    }
    if (locality && locality !== "All") {
        query += ` AND l.name = ? `;
        params.push(locality);
    }
    if (status && status !== "All") {
        const statusConditions = [];
        const statuses = status.split(",");
        statuses.forEach((s) => {
            if (s === "Active") {
                statusConditions.push(`u.is_deactivated = 0`);
            }
            else if (s === "Inactive") {
                statusConditions.push(`u.is_deactivated = 1`);
            }
            else if (s === "Follow Up") {
                statusConditions.push(`u.status = 'Follow Up'`);
            }
            else if (s === "Guest") {
                statusConditions.push(`u.status = 'Guest'`);
            }
        });
        if (isApproved && isApproved !== "All") {
            const isApprovedCondition = isApproved === "Yes" ? `da.is_approve = 1` : `da.is_approve = 0`;
            query += ` AND ${isApprovedCondition} `;
        }
        if (statusConditions.length > 0) {
            query += ` AND (${statusConditions.join(" OR ")}) `;
        }
    }
    // Total count query remains the same
    let totalCountQuery = `
    SELECT COUNT(*) as total 
    FROM users u
    LEFT JOIN delivery_addresses da ON u.id = da.user_id
    LEFT JOIN localities l ON da.locality_id = l.id
    WHERE u.id IS NOT NULL
  `;
    if (locality && locality !== "All") {
        totalCountQuery += ` AND l.name = ?`;
        params.push(locality);
    }
    const totalCountConditions = [];
    if (status && status !== "All") {
        const statuses = status.split(",");
        statuses.forEach((s) => {
            if (s === "Active") {
                totalCountConditions.push(`u.is_deactivated = 0`);
            }
            else if (s === "Inactive") {
                totalCountConditions.push(`u.is_deactivated = 1`);
            }
        });
        if (totalCountConditions.length > 0) {
            totalCountQuery += ` AND (${totalCountConditions.join(" OR ")}) `;
        }
    }
    const [[totalCount]] = await databaseConnection_1.db
        .promise()
        .query(totalCountQuery, params);
    query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?;`;
    params.push(limit, offset);
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    const statusCountQuery = `
    SELECT 
      SUM(u.is_deactivated = 0) AS active_count,
      SUM(u.is_deactivated = 1) AS inactive_count,
      SUM(u.status = 'Follow Up') AS follow_up_count,
      SUM(u.status = 'Guest') AS guest_count
    FROM users u
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
                created_at: row.address_created_at,
                updated_at: row.address_updated_at,
            },
        })),
        total: totalCount.total,
        statusCount,
    };
};
exports.getAllCustomers = getAllCustomers;
// Create a new customer
const createCustomer = async (localityId, name, email, mobile, houseNo, completeAddress, status) => {
    try {
        // Check if the email already exists
        const existingUserQuery = `
      SELECT id FROM users WHERE email = ?;
    `;
        const [existingUsers] = await databaseConnection_1.db
            .promise()
            .query(existingUserQuery, [email]);
        if (existingUsers.length > 0) {
            throw new Error(`User with email ${email} already exists`);
        }
        // Insert user into users table
        const insertUserQuery = `
      INSERT INTO users (name, email, phone, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
        const [userResult] = await databaseConnection_1.db
            .promise()
            .query(insertUserQuery, [name, email, mobile, status]);
        // Insert address into delivery_addresses table
        const insertAddressQuery = `
     INSERT INTO delivery_addresses (user_id, locality_id, house_no, complete_address, created_at, updated_at) 
  VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
        const addressValues = [
            userResult.insertId,
            localityId,
            houseNo,
            completeAddress,
        ];
        await databaseConnection_1.db.promise().query(insertAddressQuery, addressValues);
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
      l.id AS locality_id,
      l.name AS locality_name,
      cf.id AS custom_field_id,
      cf.name AS custom_field_name,
      cp.id AS priority_id,
      cp.mark_priority
    FROM 
      users u
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
    LEFT JOIN 
      localities l ON da.locality_id = l.id
    LEFT JOIN 
      custom_fields cf ON u.id = cf.custom_field_model
    LEFT JOIN 
      customer_priorities cp ON u.id = cp.id 
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
        paypal_email: row.paypal_email,
        remember_token: row.remember_token,
        status: row.status,
        is_deactivated: row.is_deactivated,
        is_deactivated_at: row.is_deactivated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
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
// Update customer by ID
const updateCustomerById = async (id, localityId, name, email, mobile, houseNo, completeAddress, status) => {
    try {
        const existingUserQuery = `SELECT id FROM users WHERE id = ?;`;
        const [existingUsers] = await databaseConnection_1.db.promise().query(existingUserQuery, [id]);
        if (existingUsers.length === 0) {
            throw new Error(`User with ID ${id} does not exist`);
        }
        if (email) {
            const duplicateEmailQuery = `SELECT id FROM users WHERE email = ? AND id != ?;`;
            const [duplicateEmails] = await databaseConnection_1.db.promise().query(duplicateEmailQuery, [email, id]);
            if (duplicateEmails.length > 0) {
                throw new Error(`Email ${email} is already in use by another customer`);
            }
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
        await databaseConnection_1.db.promise().query(updateUserQuery, [name, email, mobile, status, id]);
        const updateAddressQuery = `
      UPDATE delivery_addresses SET
      locality_id = COALESCE(?, locality_id),
      house_no = COALESCE(?, house_no),
      complete_address = COALESCE(?, complete_address),
      updated_at = NOW()
      WHERE user_id = ?;
    `;
        await databaseConnection_1.db.promise().query(updateAddressQuery, [localityId, houseNo, completeAddress, id]);
    }
    catch (error) {
        console.error("Error updating customer:", error.message);
        throw new Error("Error updating customer: " + error.message);
    }
};
exports.updateCustomerById = updateCustomerById;
// Delete customer by ID
const deleteCustomerById = async (customerId) => {
    const connection = await databaseConnection_1.db.promise().getConnection();
    await connection.beginTransaction();
    try {
        await connection.query("DELETE FROM delivery_addresses WHERE user_id = ?", [customerId]);
        await connection.query("DELETE FROM users WHERE id = ?", [customerId]);
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
