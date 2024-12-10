import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllDeliveryBoysWithLocalities = async (
  limit: number,
  offset: number,
  searchTerm: string
): Promise<{
  deliveryBoys: Array<{
    delivery_boy_id: number;
    user_id: number;
    delivery_boy_name: string;
    mobile: string;
    active: boolean;
    cash_collection: number;
    delivery_fee: number;
    total_orders: number;
    earning: number;
    available: boolean;
    addressPickup: string;
    latitudePickup: number;
    longitudePickup: number;
    delivery_boy_created_at: string;
    delivery_boy_updated_at: string;
    localities: Array<{
      locality_id: number;
      route_id: number | null;
      hub_id: number | null;
      locality_name: string;
      locality_address: string;
      google_address: string;
      locality_latitude: number;
      locality_longitude: number;
      locality_city: string;
      locality_active: boolean;
      locality_created_at: string;
      locality_updated_at: string;
    }>;
  }>;
  totalCount: number;
}> => {
  const searchCondition = searchTerm
    ? `WHERE db.name LIKE ? OR db.mobile LIKE ?`
    : "";
  const searchParams = searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`] : [];

  // Subquery to select distinct delivery_boy_id with LIMIT and OFFSET
  const [rows] = await db.promise().query<RowDataPacket[]>(
    `SELECT 
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
        SELECT DISTINCT db.id
        FROM delivery_boys db
        ${searchCondition}
        ORDER BY db.id ASC
        LIMIT ? OFFSET ?
      ) AS limited_db
      INNER JOIN delivery_boys db ON limited_db.id = db.id
      LEFT JOIN locality_delivery_boys ldb ON db.id = ldb.delivery_boy_id
      LEFT JOIN localities l ON ldb.locality_id = l.id
      ORDER BY db.id ASC`,
    [...searchParams, limit, offset]
  );

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
  const [[totalCountRow]] = await db.promise().query<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT db.id) as totalCount
     FROM delivery_boys db
     ${searchCondition}`,
    searchParams
  );

  const totalCount = totalCountRow.totalCount;

  return { deliveryBoys, totalCount };
};


// Create a new delivery boy
export const createDeliveryBoy = async (
  userId: number,
  name: string | null,
  mobile: string | null,
  active: boolean,
  cashCollection: boolean,
  deliveryFee: number,
  totalOrders: number,
  earning: number,
  available: boolean,
  addressPickup: string | null,
  latitudePickup: string | null,
  longitudePickup: string | null
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO delivery_boys (user_id, name, mobile, active, cash_collection, delivery_fee, total_orders, earning, available, addressPickup, latitudePickup, longitudePickup, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
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
      ]
    );
};

// Fetch delivery boy by ID
export const getDeliveryBoyById = async (
  id: number
): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM delivery_boys WHERE id = ?", [id]);
  return rows;
};

// Update delivery boy by ID
export const updateDeliveryBoyById = async (
  id: number,
  userId: number,
  name: string | null,
  mobile: string | null,
  active: boolean,
  cashCollection: boolean,
  deliveryFee: number,
  totalOrders: number,
  earning: number,
  available: boolean,
  addressPickup: string | null,
  latitudePickup: string | null,
  longitudePickup: string | null
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE delivery_boys SET user_id = ?, name = ?, mobile = ?, active = ?, cash_collection = ?, delivery_fee = ?, total_orders = ?, earning = ?, available = ?, addressPickup = ?, latitudePickup = ?, longitudePickup = ? WHERE id = ?",
      [
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
      ]
    );
};

// Delete delivery boy by ID
export const deleteDeliveryBoyById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM delivery_boys WHERE id = ?", [id]);
};
