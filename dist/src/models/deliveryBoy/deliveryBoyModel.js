"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLocalitiesByDeliveryBoyId = exports.deleteDeliveryBoyById = exports.updateDeliveryBoyById = exports.getDeliveryBoyById = exports.createDeliveryBoy = exports.getAllDeliveryBoysWithLocalities = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllDeliveryBoysWithLocalities = async (limit, page, searchTerm, sortField, sortOrder) => {
    const offset = (page - 1) * limit;
    const activeFilter = searchTerm.toLowerCase() === "active"
        ? "AND db.active = 1"
        : searchTerm.toLowerCase() === "inactive"
            ? "AND db.active = 0"
            : "";
    const searchCondition = searchTerm && !["active", "inactive"].includes(searchTerm)
        ? `WHERE db.name LIKE ? OR db.mobile LIKE ?`
        : `WHERE 1=1`;
    const searchParams = searchTerm && !["active", "inactive"].includes(searchTerm)
        ? [`%${searchTerm}%`, `%${searchTerm}%`]
        : [];
    const validSortFields = {
        delivery_boy_name: "db.name",
        mobile: "db.mobile",
        active: "db.active",
        cash_collection: "db.cash_collection",
    };
    const sortColumn = validSortFields[sortField] || "db.created_at";
    const validSortOrder = sortOrder === "desc" ? "desc" : "asc";
    const [rows] = await databaseConnection_1.db.promise().query(`
    SELECT 
      db.id AS delivery_boy_id,
      db.user_id,
      db.name AS delivery_boy_name,
      db.mobile,
      db.active,
      db.cash_collection,
      db.delivery_fee,
      db.total_orders,
      db.earning,
      db.available,
      db.addressPickup,
      db.latitudePickup,
      db.longitudePickup,
      db.created_at AS delivery_boy_created_at,
      db.updated_at AS delivery_boy_updated_at,
      ldb.id AS delivery_boy_locality_id,
      ldb.locality_id,
      l.id AS locality_id,
      l.route_id,
      l.hub_id,
      l.name AS locality_name,
      l.address AS locality_address,
      l.google_address,
      l.latitude AS locality_latitude,
      l.longitude AS locality_longitude,
      l.city AS locality_city,
      l.active AS locality_active,
      l.created_at AS locality_created_at,
      l.updated_at AS locality_updated_at
    FROM (
      SELECT DISTINCT db.id, db.created_at
      FROM delivery_boys db
      ${searchCondition} ${activeFilter}
      ORDER BY db.created_at DESC
      LIMIT ? OFFSET ?
    ) AS limited_db
    LEFT JOIN delivery_boys db ON limited_db.id = db.id
    LEFT JOIN locality_delivery_boys ldb ON db.id = ldb.delivery_boy_id
    LEFT JOIN localities l ON ldb.locality_id = l.id
    ORDER BY ${sortColumn} ${validSortOrder}
  `, [...searchParams, limit, offset]);
    const deliveryBoysMap = new Map();
    rows.forEach((row) => {
        const deliveryBoyId = row.delivery_boy_id;
        if (!deliveryBoysMap.has(deliveryBoyId)) {
            deliveryBoysMap.set(deliveryBoyId, {
                delivery_boy_id: row.delivery_boy_id,
                user_id: row.user_id,
                delivery_boy_name: row.delivery_boy_name,
                mobile: row.mobile,
                active: row.active,
                cash_collection: row.cash_collection,
                delivery_fee: row.delivery_fee,
                total_orders: row.total_orders,
                earning: row.earning,
                available: row.available,
                addressPickup: row.addressPickup,
                latitudePickup: row.latitudePickup,
                longitudePickup: row.longitudePickup,
                delivery_boy_created_at: row.delivery_boy_created_at,
                delivery_boy_updated_at: row.delivery_boy_updated_at,
                localities: [],
            });
        }
        if (row.locality_id) {
            deliveryBoysMap.get(deliveryBoyId).localities.push({
                localityDeliveryBoysId: row.delivery_boy_locality_id,
                locality_id: row.locality_id,
                route_id: row.route_id,
                hub_id: row.hub_id,
                locality_name: row.locality_name,
                locality_address: row.locality_address,
                google_address: row.google_address,
                locality_latitude: row.locality_latitude,
                locality_longitude: row.locality_longitude,
                locality_city: row.locality_city,
                locality_active: row.locality_active,
                locality_created_at: row.locality_created_at,
                locality_updated_at: row.locality_updated_at,
            });
        }
    });
    const deliveryBoys = Array.from(deliveryBoysMap.values());
    // Query to get the total count of distinct delivery_boy_id
    const [[totalCountRow]] = await databaseConnection_1.db.promise().query(`
    SELECT COUNT(DISTINCT db.id) as totalCount
    FROM delivery_boys db
    ${searchCondition} ${activeFilter}
  `, searchParams);
    const totalCount = totalCountRow.totalCount;
    return { deliveryBoys, totalCount };
};
exports.getAllDeliveryBoysWithLocalities = getAllDeliveryBoysWithLocalities;
// Create a new delivery boy
const createDeliveryBoy = async (data) => {
    const { userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup, localityIds, } = data;
    const connection = await databaseConnection_1.db.promise().getConnection();
    try {
        await connection.beginTransaction();
        // Insert into delivery_boys table
        const [insertResult] = await connection.query(`INSERT INTO delivery_boys 
      (user_id, name, mobile, active, cash_collection, delivery_fee, total_orders, earning, available, 
       addressPickup, latitudePickup, longitudePickup, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
            userId,
            name,
            mobile,
            active ? 1 : 0,
            cashCollection ? 1 : 0,
            deliveryFee,
            totalOrders,
            earning,
            available ? 1 : 0,
            addressPickup,
            latitudePickup,
            longitudePickup,
        ]);
        const deliveryBoyId = insertResult.insertId;
        // Remove existing assignments for the given localityIds
        if (localityIds && localityIds.length > 0) {
            await connection.query(`DELETE FROM locality_delivery_boys WHERE locality_id IN (?)`, [localityIds]);
            // Insert new assignments
            const values = localityIds.map((localityId) => [
                deliveryBoyId,
                localityId,
                new Date(),
                new Date(),
            ]);
            await connection.query(`INSERT INTO locality_delivery_boys (delivery_boy_id, locality_id, created_at, updated_at) VALUES ?`, [values]);
        }
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.createDeliveryBoy = createDeliveryBoy;
// Fetch delivery boy by ID
const getDeliveryBoyById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM delivery_boys WHERE id = ?", [id]);
    return rows;
};
exports.getDeliveryBoyById = getDeliveryBoyById;
// Update delivery boy by ID
const updateDeliveryBoyById = async (id, userId, name, mobile, active, cashCollection, deliveryFee, totalOrders, earning, available, addressPickup, latitudePickup, longitudePickup) => {
    await databaseConnection_1.db.promise().query(`UPDATE delivery_boys 
       SET user_id = ?, name = ?, mobile = ?, active = ?, cash_collection = ?, 
           delivery_fee = ?, total_orders = ?, earning = ?, available = ?, 
           addressPickup = ?, latitudePickup = ?, longitudePickup = ? 
       WHERE id = ?`, [
        userId,
        name,
        mobile,
        active ? 1 : 0,
        cashCollection ? 1 : 0,
        deliveryFee,
        totalOrders,
        earning,
        available ? 1 : 0,
        addressPickup,
        latitudePickup,
        longitudePickup,
        id,
    ]);
};
exports.updateDeliveryBoyById = updateDeliveryBoyById;
// Delete delivery boy by ID
const deleteDeliveryBoyById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM delivery_boys WHERE id = ?", [id]);
};
exports.deleteDeliveryBoyById = deleteDeliveryBoyById;
const deleteLocalitiesByDeliveryBoyId = async (id) => {
    const connection = await databaseConnection_1.db.promise().getConnection();
    console.log("deliveryBoyId", id);
    try {
        await connection.beginTransaction();
        // Delete specific locality assignments and get affected rows
        const [result] = await connection.query(`DELETE FROM locality_delivery_boys WHERE id = ?`, [id]);
        if (result.affectedRows === 0) {
            throw new Error("No matching locality assignments found for deletion.");
        }
        await connection.commit();
    }
    catch (error) {
        await connection.rollback();
        throw error; // Re-throw the error to be caught by the controller
    }
    finally {
        connection.release();
    }
};
exports.deleteLocalitiesByDeliveryBoyId = deleteLocalitiesByDeliveryBoyId;
