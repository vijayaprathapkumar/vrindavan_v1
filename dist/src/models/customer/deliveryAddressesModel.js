"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeliveryAddressById = exports.updateDeliveryAddressById = exports.getDeliveryAddress = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getDeliveryAddress = async (page, limit, searchTerm, sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    const searchValue = `%${searchTerm}%`;
    const validSortFields = {
        name: "u.name",
        phone: "u.phone",
        complete_address: "da.complete_address",
        is_approve: "da.is_approve",
        address_created_at: "da.created_at",
    };
    const isApproveValue = searchTerm.toLowerCase() === 'yes' ? 1 : searchTerm.toLowerCase() === 'no' ? 0 : undefined;
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
           ${isApproveValue !== undefined ? 'OR da.is_approve = ?' : ''}
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
      ${isApproveValue !== undefined ? 'OR da.is_approve = ?' : ''}
    );
  `;
    try {
        // Fetch total count
        const [[{ total }]] = await databaseConnection_1.db
            .promise()
            .query(countQuery, [
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            ...(isApproveValue !== undefined ? [isApproveValue] : [])
        ]);
        // Fetch paginated results
        const [rows] = await databaseConnection_1.db
            .promise()
            .query(query, [
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            ...(isApproveValue !== undefined ? [isApproveValue] : []),
            limit,
            offset,
        ]);
        return { deliveryAddresses: rows, total };
    }
    catch (error) {
        console.error("Error fetching default addresses with users:", error.message);
        throw new Error("Error fetching delivery addresses");
    }
};
exports.getDeliveryAddress = getDeliveryAddress;
const updateDeliveryAddressById = async (id, approveStatus, locality_id) => {
    const [result] = await databaseConnection_1.db.promise().query(`UPDATE delivery_addresses 
     SET is_approve = ?, locality_id = ?, updated_at = NOW() 
     WHERE id = ?`, [approveStatus, locality_id, id]);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await databaseConnection_1.db.promise().query(`SELECT * FROM delivery_addresses WHERE id = ?`, [id]);
    return rows.length > 0 ? rows[0] : null;
};
exports.updateDeliveryAddressById = updateDeliveryAddressById;
// Delete Delivery Address
const deleteDeliveryAddressById = async (id) => {
    const [result] = await databaseConnection_1.db.promise().query(`DELETE FROM delivery_addresses WHERE id = ?`, [id]);
    return result.affectedRows > 0;
};
exports.deleteDeliveryAddressById = deleteDeliveryAddressById;
