import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all customers
export const getAllCustomers = async (
  page: number,
  limit: number,
  locality?: string,
  status?: string,
  searchTerm?: string,
  isApproved?: string
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

  const params: any[] = [];

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
      } else if (s === "Inactive") {
        statusConditions.push(`u.is_deactivated = 1`);
      } else if (s === "Follow Up") {
        statusConditions.push(`u.status = 'Follow Up'`);
      } else if (s === "Guest") {
        statusConditions.push(`u.status = 'Guest'`);
      }
    });

    if (isApproved && isApproved !== "All") {
      const isApprovedCondition =
        isApproved === "Yes" ? `da.is_approve = 1` : `da.is_approve = 0`;
      query += ` AND ${isApprovedCondition} `;
    }

    if (statusConditions.length > 0) {
      query += ` AND (${statusConditions.join(" OR ")}) `;
    }
  }

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
      } else if (s === "Inactive") {
        totalCountConditions.push(`u.is_deactivated = 1`);
      }
    });

    if (totalCountConditions.length > 0) {
      totalCountQuery += ` AND (${totalCountConditions.join(" OR ")}) `;
    }
  }

  const [[totalCount]] = await db
    .promise()
    .query<RowDataPacket[]>(totalCountQuery, params);

  query += ` LIMIT ? OFFSET ?;`;
  params.push(limit, offset);

  const [rows] = await db.promise().query<RowDataPacket[]>(query, params);

  const statusCountQuery = `
    SELECT 
      SUM(u.is_deactivated = 0) AS active_count,
      SUM(u.is_deactivated = 1) AS inactive_count,
      SUM(u.status = 'Follow Up') AS follow_up_count,
      SUM(u.status = 'Guest') AS guest_count
    FROM users u
  `;
  const [[statusCount]] = await db
    .promise()
    .query<RowDataPacket[]>(statusCountQuery);

  return {
    customers: rows.map((row) => ({
      userId: row.user_id,
      userName: row.user_name,
      email: row.email,
      phone: row.phone,
      apiToken: row.api_token,
      deviceToken: row.device_token,
      deliveryPriority: row.delivery_priority,
      creditLimit: row.credit_limit,
      stripeId: row.stripe_id,
      cardBrand: row.card_brand,
      cardLastFour: row.card_last_four,
      trialEndsAt: row.trial_ends_at,
      braintreeId: row.braintree_id,
      paypalEmail: row.paypal_email,
      rememberToken: row.remember_token,
      status: row.status,
      isDeactivated: row.is_deactivated,
      isDeactivatedAt: row.is_deactivated_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      address: {
        addressId: row.address_id,
        description: row.description,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        houseNo: row.house_no,
        completeAddress: row.complete_address,
        isApproved: row.is_approve,
        isDefault: row.is_default,
        localityId: row.locality_id,
        localityName: row.locality_name,
        createdAt: row.address_created_at,
        updatedAt: row.address_updated_at,
      },
    })),
    total: totalCount.total,
    statusCount,
  };
};

// Create a new customer
export const createCustomer = async (
  localityId: number,
  name: string,
  email: string,
  mobile: string,
  houseNo: string,
  completeAddress: string,
  status?: string
): Promise<void> => {
  try {
    // Check if the email already exists
    const existingUserQuery = `
      SELECT id FROM users WHERE email = ?;
    `;
    const [existingUsers] = await db
      .promise()
      .query<RowDataPacket[]>(existingUserQuery, [email]);

    if (existingUsers.length > 0) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Insert user into users table
    const insertUserQuery = `
      INSERT INTO users (name, email, phone) VALUES (?, ?, ?);
    `;
    const [userResult] = await db
      .promise()
      .query<OkPacket>(insertUserQuery, [name, email, mobile]);

    // Insert address into delivery_addresses table
    const insertAddressQuery = `
      INSERT INTO delivery_addresses (user_id, locality_id, house_no, complete_address) 
      VALUES (?, ?, ?, ?);
    `;

    const addressValues = [
      userResult.insertId,
      localityId,
      houseNo,
      completeAddress,
    ];

    await db.promise().query<OkPacket>(insertAddressQuery, addressValues);
  } catch (error) {
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

  const [rows] = await db.promise().query<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    userId: row.user_id,
    userName: row.user_name,
    email: row.email,
    phone: row.phone,
    apiToken: row.api_token,
    deviceToken: row.device_token,
    deliveryPriority: row.delivery_priority,
    creditLimit: row.credit_limit,
    stripeId: row.stripe_id,
    cardBrand: row.card_brand,
    cardLastFour: row.card_last_four,
    trialEndsAt: row.trial_ends_at,
    braintreeId: row.braintree_id,
    paypalEmail: row.paypal_email,
    rememberToken: row.remember_token,
    status: row.status,
    isDeactivated: row.is_deactivated,
    isDeactivatedAt: row.is_deactivated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    address: {
      addressId: row.address_id,
      description: row.description,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      houseNo: row.house_no,
      completeAddress: row.complete_address,
      isApproved: row.is_approve,
      isDefault: row.is_default,
      localityId: row.locality_id,
      localityName: row.locality_name,
      createdAt: row.address_created_at,
      updatedAt: row.address_updated_at,
    },
    customFields: row.custom_field_id
      ? [
          {
            customFieldId: row.custom_field_id,
            name: row.custom_field_name,
          },
        ]
      : [],
    priorities: row.priority_id
      ? [
          {
            priorityId: row.priority_id,
            markPriority: row.mark_priority,
          },
        ]
      : [],
  };
};

// Update customer by ID
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
    // Check if the customer exists
    const existingUserQuery = `SELECT id FROM users WHERE id = ?;`;
    const [existingUsers] = await db
      .promise()
      .query<RowDataPacket[]>(existingUserQuery, [id]);

    if (existingUsers.length === 0) {
      throw new Error(`User with ID ${id} does not exist`);
    }

    // Update user in users table
    const updateUserQuery = `
      UPDATE users SET
      name = COALESCE(?, name),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone)
      WHERE id = ?;
    `;

    await db
      .promise()
      .query<OkPacket>(updateUserQuery, [name, email, mobile, id]);

    // Update delivery address in delivery_addresses table
    const updateAddressQuery = `
      UPDATE delivery_addresses SET
      locality_id = COALESCE(?, locality_id),
      house_no = COALESCE(?, house_no),
      complete_address = COALESCE(?, complete_address)
      WHERE user_id = ?;
    `;

    const addressValues = [localityId, houseNo, completeAddress];
    if (status) {
      addressValues.push(status);
    }
    addressValues.push(id);

    await db.promise().query<OkPacket>(updateAddressQuery, addressValues);
  } catch (error) {
    throw new Error(
      "Error updating customer: " + (error.message || "Unknown error")
    ); // Provide a more informative message
  }
};

// Delete customer by ID
export const deleteCustomerById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM delivery_addresses WHERE id = ?", [id]);
};
