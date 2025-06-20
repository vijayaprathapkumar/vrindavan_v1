import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllLocalities = async (
  page: number,
  limit: number,
  searchTerm: string,
  sortField?: string,
  sortOrder?: string
): Promise<{ localities: RowDataPacket[]; totalRecords: number }> => {
  const offset = (page - 1) * limit;

  const validSortFields: Record<string, string> = {
    localities_name: "l.name",
    delivery_boy_name: "db.name",
    localities_address: "l.address",
    localities_city: "l.city",
    localities_active: "l.active",
  };

  const sortColumn = validSortFields[sortField] || validSortFields.localities_name;
  const validSortOrder = sortOrder?.toLowerCase() === "desc" ? "desc" : "asc";

  let whereClause = `WHERE 1=1`;
  const params: any[] = [];

  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm === "active") {
      whereClause += ` AND l.active = ?`;
      params.push(1);
    } else if (lowerSearchTerm === "inactive") {
      whereClause += ` AND l.active = ?`;
      params.push(0);
    } else {
      whereClause += ` AND (l.name LIKE ? OR l.city LIKE ? OR l.address LIKE ? OR h.name LIKE ? OR db.name LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
  }

  const localitiesQuery = `
      SELECT 
          lb.id AS locality_delivery_boys_id,
          lb.locality_id AS locality_delivery_boys_locality_id,
          lb.delivery_boy_id AS locality_delivery_boys_delivery_boy_id,

          l.id,
          l.route_id AS localities_route_id,
          l.hub_id AS localities_hub_id,
          l.name AS localities_name,
          l.address AS localities_address,
          l.google_address AS localities_google_address,
          l.latitude AS localities_latitude,
          l.longitude AS localities_longitude,
          l.city AS localities_city,
          l.active AS localities_active,
          l.created_at AS localities_created_at,
          l.updated_at AS localities_updated_at,

          db.id AS delivery_boy_id,
          db.name AS delivery_boy_name,
          db.mobile AS delivery_boy_mobile,
          db.active AS delivery_boy_active,
          db.cash_collection AS delivery_boy_cash_collection,
          db.delivery_fee AS delivery_boy_delivery_fee,
          db.total_orders AS delivery_boy_total_orders,
          db.earning AS delivery_boy_earning,
          db.available AS delivery_boy_available,
          db.addressPickup AS delivery_boy_address_pickup,
          db.latitudePickup AS delivery_boy_latitude_pickup,
          db.longitudePickup AS delivery_boy_longitude_pickup
      FROM 
          localities l
      LEFT JOIN 
          locality_delivery_boys lb ON l.id = lb.locality_id
      LEFT JOIN 
          hubs h ON l.hub_id = h.id 
      LEFT JOIN 
          delivery_boys db ON lb.delivery_boy_id = db.user_id
      ${whereClause}
      ORDER BY ${sortColumn} ${validSortOrder}
      LIMIT ? OFFSET ?;
  `;

  params.push(limit, offset);

  const [localities]: [RowDataPacket[], any] = await db.promise().query(localitiesQuery, params);

  const countQuery = `
    SELECT COUNT(DISTINCT l.id) AS total
    FROM localities l
    LEFT JOIN hubs h ON l.hub_id = h.id
    LEFT JOIN delivery_boys db ON l.id = db.id
    ${whereClause}
  `;

  const [[{ total }]]: [RowDataPacket[], any] = await db.promise().query(countQuery, params.slice(0, -2));

  return { localities, totalRecords: total };
};

export const createLocality = async (
  routeId: number | null,
  hubId: number | null,
  name: string,
  address: string,
  googleAddress: string | null,
  latitude: string | null,
  longitude: string | null,
  city: string | null,
  active: number,
  deliveryBoyId: number
): Promise<void> => {
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    const [localityResult] = await connection.query<OkPacket>(
      `INSERT INTO localities 
        (route_id, hub_id, name, address, google_address, latitude, longitude, city, active, created_at, updated_at)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        routeId,
        hubId,
        name,
        address,
        googleAddress,
        latitude,
        longitude,
        city,
        active,
      ]
    );

    const localityId = localityResult.insertId;

    await connection.query(
      `INSERT INTO locality_delivery_boys 
        (locality_id, delivery_boy_id, created_at)
      VALUES
        (?, ?, NOW())`,
      [localityId, deliveryBoyId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Fetch locality by ID
export const getLocalityById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    `SELECT localities.*, hubs.name as hub_name 
     FROM localities 
     LEFT JOIN hubs ON localities.hub_id = hubs.id
     WHERE localities.id = ?`,
    [id]
  );
  return rows;
};

// Update locality by ID
export const updateLocalityById = async (
  id: number,
  routeId: number | null,
  hubId: number | null,
  name: string,
  address: string,
  googleAddress: string | null,
  latitude: string | null,
  longitude: string | null,
  city: string | null,
  active: number,
  deliveryBoyId: number
): Promise<void> => {
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();
    await connection.query<OkPacket>(
      `UPDATE localities 
       SET route_id = ?, hub_id = ?, name = ?, address = ?, google_address = ?, latitude = ?, longitude = ?, city = ?, active = ?, updated_at = NOW() 
       WHERE id = ?`,
      [
        routeId,
        hubId,
        name,
        address,
        googleAddress,
        latitude,
        longitude,
        city,
        active,
        id,
      ]
    );

    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM locality_delivery_boys WHERE locality_id = ?`,
      [id]
    );

    if (rows.length > 0) {
      await connection.query<OkPacket>(
        `UPDATE locality_delivery_boys 
         SET delivery_boy_id = ?, updated_at = NOW() 
         WHERE locality_id = ?`,
        [deliveryBoyId, id]
      );
    } else {
      await connection.query<OkPacket>(
        `INSERT INTO locality_delivery_boys 
         (locality_id, delivery_boy_id, created_at) 
         VALUES (?, ?, NOW())`,
        [id, deliveryBoyId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Delete locality by ID
export const deleteLocalityById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM localities WHERE id = ?", [id]);
};
