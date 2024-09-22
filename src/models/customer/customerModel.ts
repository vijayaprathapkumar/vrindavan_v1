import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all customers
export const getAllCustomers = async (): Promise<any[]> => {
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
      cf.id AS custom_field_id,
      cf.name AS custom_field_name,
      cf.type AS custom_field_type,
      cf.values AS custom_field_values,
      cf.disabled AS custom_field_disabled,
      cf.required AS custom_field_required,
      cf.in_table AS custom_field_in_table,
      cf.bootstrap_column AS custom_field_bootstrap_column,
      cf.order AS custom_field_order,
      cf.custom_field_model AS custom_field_model,
      cp.id AS priority_id,
      cp.mark_priority,
      cp.created_at AS priority_created_at,
      cp.updated_at AS priority_updated_at
    FROM 
      users u
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
    LEFT JOIN 
      custom_fields cf ON u.id = cf.custom_field_model
    LEFT JOIN 
      customer_priorities cp ON u.id = cp.id 
    WHERE 
      u.id IS NOT NULL;
  `;

  const [rows] = await db.promise().query<RowDataPacket[]>(query);

  return rows.map((row) => ({
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
      createdAt: row.address_created_at,
      updatedAt: row.address_updated_at,
    },
    customFields: row.custom_field_id
      ? [
          {
            customFieldId: row.custom_field_id,
            name: row.custom_field_name,
            type: row.custom_field_type,
            values: row.custom_field_values,
            disabled: row.custom_field_disabled,
            required: row.custom_field_required,
            inTable: row.custom_field_in_table,
            bootstrapColumn: row.custom_field_bootstrap_column,
            order: row.custom_field_order,
          },
        ]
      : [],
    priorities: row.priority_id
      ? [
          {
            priorityId: row.priority_id,
            markPriority: row.mark_priority,
            createdAt: row.priority_created_at,
            updatedAt: row.priority_updated_at,
          },
        ]
      : [],
  }));
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
      da.created_at AS address_created_at,
      da.updated_at AS address_updated_at,
      cf.id AS custom_field_id,
      cf.name AS custom_field_name,
      cf.type AS custom_field_type,
      cf.values AS custom_field_values,
      cf.disabled AS custom_field_disabled,
      cf.required AS custom_field_required,
      cf.in_table AS custom_field_in_table,
      cf.bootstrap_column AS custom_field_bootstrap_column,
      cf.order AS custom_field_order,
      cf.custom_field_model AS custom_field_model,
      cp.id AS priority_id,
      cp.mark_priority,
      cp.created_at AS priority_created_at,
      cp.updated_at AS priority_updated_at
    FROM 
      users u
    LEFT JOIN 
      delivery_addresses da ON u.id = da.user_id
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
      createdAt: row.address_created_at,
      updatedAt: row.address_updated_at,
    },
    customFields: row.custom_field_id
      ? [
          {
            customFieldId: row.custom_field_id,
            name: row.custom_field_name,
            type: row.custom_field_type,
            values: row.custom_field_values,
            disabled: row.custom_field_disabled,
            required: row.custom_field_required,
            inTable: row.custom_field_in_table,
            bootstrapColumn: row.custom_field_bootstrap_column,
            order: row.custom_field_order,
          },
        ]
      : [],
    priorities: row.priority_id
      ? [
          {
            priorityId: row.priority_id,
            markPriority: row.mark_priority,
            createdAt: row.priority_created_at,
            updatedAt: row.priority_updated_at,
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
