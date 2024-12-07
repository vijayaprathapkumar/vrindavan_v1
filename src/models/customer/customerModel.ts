import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";

// Fetch all customers
export const getAllCustomers = async (
  page: number,
  limit: number,
  locality?: string,
  status?: string,
  searchTerm?: string,
): Promise<{ customers: any[]; total: number; statusCount: any }> => {
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
      l.name AS locality_name,
      wb.balance AS wallet_balance
    FROM 
      users u
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
    LEFT JOIN 
      localities l ON da.locality_id = l.id
    LEFT JOIN wallet_balances wb ON u.id = wb.user_id
    WHERE 
      u.id IS NOT NULL
  `;

  const params: any[] = [];

  if (searchTerm) {
    const searchValue = `%${searchTerm}%`;
    query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?) `;
    params.push(searchValue, searchValue, searchValue);
  }

  if (locality && locality !== "All") {
    query += ` AND l.id = ? `;
    params.push(parseInt(locality));
  }

  let totalCountQuery = `
    SELECT COUNT(*) as total 
    FROM users u
    LEFT JOIN delivery_addresses da ON u.id = da.user_id
    LEFT JOIN localities l ON da.locality_id = l.id
    WHERE u.id IS NOT NULL
  `;

  if (locality && locality !== "All") {
    totalCountQuery += ` AND l.id = ?`;
    params.push(parseInt(locality));
  }

  if (status && status !== "All") {
    query += ` AND u.status = ? `;
    params.push(status);
  }


  const [[totalCount]] = await db
    .promise()
    .query<RowDataPacket[]>(totalCountQuery, params);

  query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?;`;

  params.push(limit, offset);

  const [rows] = await db.promise().query<RowDataPacket[]>(query, params);

  const statusCountQuery = `
    SELECT 
      SUM(u.status = '0') AS status_0_count,
      SUM(u.status = '1') AS status_1_count,
      SUM(u.status = '2') AS status_2_count
    FROM users u
  `;
  const [[statusCount]] = await db
    .promise()
    .query<RowDataPacket[]>(statusCountQuery);
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

export const createCustomer = async (
  localityId: number,
  name: string,
  email: string,
  mobile: string,
  houseNo: string,
  completeAddress: string,
  status?: string,
  password?: string
): Promise<number | null> => {
  if (
    !localityId ||
    !name ||
    !email ||
    !mobile ||
    !houseNo ||
    !completeAddress
  ) {
    throw new Error("All fields are required.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  try {
    const existingUserQuery = `SELECT id FROM users WHERE email = ?;`;
    const [existingUsers] = await db
      .promise()
      .query<RowDataPacket[]>(existingUserQuery, [email]);

    if (existingUsers.length !== 0) {
      return null;
    }

    // Insert new user
    const insertUserQuery = `
      INSERT INTO users (name, email, phone, status,password, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW());
    `;
    const [userResult] = await db
      .promise()
      .query<ResultSetHeader>(insertUserQuery,  [name, email, mobile, status, password || ""]);

    const userId = userResult.insertId;

    // Insert user address into delivery_addresses table
    const insertAddressQuery = `
      INSERT INTO delivery_addresses (user_id, locality_id, house_no, complete_address, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW());
    `;
    await db
      .promise()
      .query<ResultSetHeader>(insertAddressQuery, [
        userId,
        localityId,
        houseNo,
        completeAddress,
      ]);

    // Insert wallet balance
    const insertWalletQuery = `
      INSERT INTO wallet_balances (user_id, balance, created_at, updated_at) 
      VALUES (?, 0, NOW(), NOW());
    `;
    await db.promise().query(insertWalletQuery, [userId]);

    return userId;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error(
      "Error creating customer: " + (error.message || "Unknown error")
    );
  }
};

// Fetch customer by ID
export const getCustomerById = async (id: number): Promise<any | null> => {
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
      cp.mark_priority,
      wb.balance AS wallet_balance
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
    LEFT JOIN wallet_balances wb ON u.id = wb.user_id
    WHERE 
      u.id = ?;
  `;

  const [rows] = await db.promise().query<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) return null;

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

export const updateCustomerById = async (
  id: number,
  localityId?: number,
  name?: string,
  email?: string,
  mobile?: string,
  houseNo?: string,
  completeAddress?: string,
  status?: string
): Promise<void> => {
  try {
    const existingUserQuery = `SELECT id FROM users WHERE email = ?;`;
    const [existingUsers] = await db
      .promise()
      .query<RowDataPacket[]>(existingUserQuery, [email]);

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

    await db
      .promise()
      .query<OkPacket>(updateUserQuery, [name, email, mobile, status, id]);

    const updateAddressQuery = `
      UPDATE delivery_addresses SET
      locality_id = COALESCE(?, locality_id),
      house_no = COALESCE(?, house_no),
      complete_address = COALESCE(?, complete_address),
      updated_at = NOW()
      WHERE user_id = ?;
    `;

    await db
      .promise()
      .query<OkPacket>(updateAddressQuery, [
        localityId,
        houseNo,
        completeAddress,
        id,
      ]);
  } catch (error) {
    console.error("Error updating customer:", error.message);
    throw new Error("Error updating customer: " + error.message);
  }
};

export const deleteCustomerById = async (customerId: number): Promise<void> => {
  const connection = await db.promise().getConnection();
  await connection.beginTransaction();

  try {
    await connection.query<OkPacket>(
      "DELETE FROM delivery_addresses WHERE user_id = ?",
      [customerId]
    );

    await connection.query<OkPacket>("DELETE FROM users WHERE id = ?", [
      customerId,
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.release();
  }
};
