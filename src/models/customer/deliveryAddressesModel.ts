import { OkPacket, RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

interface DeliveryAddress {
  id: number;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  house_no: string;
  complete_address: string;
  is_approve: boolean;
  is_default: boolean;
  user_id: number;
  locality_id: number;
  created_at: Date;
  updated_at: Date;
}

interface DeliveryAddressWithUser {
  address: DeliveryAddress;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    is_deactivated: boolean;
    created_at: Date;
    updated_at: Date;
  };
}

interface UpdateDeliveryAddress {
  id: number;
  is_approve: number;
  locality_id: number;
  updated_at: Date;
}

export const getDeliveryAddress = async (
  page: number,
  limit: number,
  searchTerm: string,
  sortField: string,
  sortOrder: string
): Promise<{ deliveryAddresses: DeliveryAddressWithUser[]; total: number }> => {
  const offset = (page - 1) * limit;
  const searchValue = `%${searchTerm}%`;

  const validSortFields: Record<string, string> = {
    customerName: "u.name",
    mobile: "u.phone",
    address: "da.complete_address",
    approveStatus: "da.is_approve",
    created_at: "da.created_at",
  };

  const orderBy = validSortFields[sortField] || "da.created_at";

  const query = `
    SELECT 
      da.id,
      da.description,
      da.address,
      da.latitude,
      da.longitude,
      da.house_no,
      da.complete_address,
      da.is_approve,
      da.is_default,
      da.user_id,
      da.locality_id,
      da.created_at AS address_created_at,
      da.updated_at AS address_updated_at,
      u.id AS user_id,
      u.name,
      u.email,
      u.phone,
      u.status,
      u.is_deactivated,
      u.created_at AS user_created_at,
      u.updated_at AS user_updated_at
    FROM 
      delivery_addresses da
    JOIN 
      users u ON da.user_id = u.id
    WHERE 
      da.is_default = 1
      AND (
        u.name LIKE ? OR 
        u.phone LIKE ? OR 
        u.email LIKE ? OR 
        da.address LIKE ? OR 
        da.house_no LIKE ? OR 
        da.complete_address LIKE ?
      )
    ORDER BY 
       ${orderBy} ${sortOrder}
    LIMIT ? OFFSET ?;
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM delivery_addresses da
    JOIN users u ON da.user_id = u.id
    WHERE da.is_default = 1
    AND (
      u.name LIKE ? OR 
      u.phone LIKE ? OR 
      u.email LIKE ? OR 
      da.address LIKE ? OR 
      da.house_no LIKE ? OR 
      da.complete_address LIKE ?
    );
  `;

  try {
    // Fetch total count
    const [[{ total }]] = await db
      .promise()
      .query<RowDataPacket[]>(countQuery, [
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
      ]);

    // Fetch paginated results
    const [rows] = await db
      .promise()
      .query<RowDataPacket[]>(query, [
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        searchValue,
        limit,
        offset,
      ]);

    return { deliveryAddresses: rows as DeliveryAddressWithUser[], total };
  } catch (error) {
    console.error("Error fetching default addresses with users:", error.message);
    throw new Error("Error fetching delivery addresses");
  }
};


export const updateDeliveryAddressById = async (
  id: number,
  approveStatus: number,
  locality_id: number
): Promise<UpdateDeliveryAddress | null> => {
  const [result] = await db.promise().query<OkPacket>(
    `UPDATE delivery_addresses 
     SET is_approve = ?, locality_id = ?, updated_at = NOW() 
     WHERE id = ?`,
    [approveStatus, locality_id, id]
  );

  if (result.affectedRows === 0) return null;

  const [rows] = await db.promise().query<RowDataPacket[]>(
    `SELECT * FROM delivery_addresses WHERE id = ?`,
    [id]
  );

  return rows.length > 0 ? (rows[0] as UpdateDeliveryAddress) : null;
};

// Delete Delivery Address
export const deleteDeliveryAddressById = async (id: number): Promise<boolean> => {
  const [result] = await db.promise().query<OkPacket>(
    `DELETE FROM delivery_addresses WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};