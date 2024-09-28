import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all localities, ordered by created_at
export const getAllLocalities = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ localities: RowDataPacket[]; totalRecords: number }> => {
  const offset = (page - 1) * limit;

  const localitiesQuery = `
    SELECT localities.*, hubs.name as hub_name 
    FROM localities 
    LEFT JOIN hubs ON localities.hub_id = hubs.id 
    WHERE localities.name LIKE ? 
       OR localities.city LIKE ? 
       OR localities.address LIKE ? 
       OR hubs.name LIKE ? 
    ORDER BY COALESCE(localities.updated_at, localities.created_at) DESC 
    LIMIT ? OFFSET ?
  `;
  
  const [localities]: [RowDataPacket[], any] = await db.promise().query(localitiesQuery, [
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    limit,
    offset,
  ]);

  const countQuery = `
    SELECT COUNT(*) as total FROM localities 
    LEFT JOIN hubs ON localities.hub_id = hubs.id 
    WHERE localities.name LIKE ? 
       OR localities.city LIKE ? 
       OR localities.address LIKE ? 
       OR hubs.name LIKE ?
  `;
  
  const [[{ total }]]: [RowDataPacket[], any] = await db.promise().query(countQuery, [
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
  ]);

  return { localities, totalRecords: total };
};

// Create a new locality
export const createLocality = async (
  routeId: number | null,
  hubId: number | null,
  name: string,
  address: string,
  googleAddress: string | null,
  latitude: string | null,
  longitude: string | null,
  city: string | null,
  active: number
): Promise<void> => {
  await db.promise().query<OkPacket>(
    `INSERT INTO localities 
      (route_id, hub_id, name, address, google_address, latitude, longitude, city, active, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, // Set created_at and updated_at to NOW()
    [routeId, hubId, name, address, googleAddress, latitude, longitude, city, active]
  );
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
  active: number
): Promise<void> => {
  await db.promise().query<OkPacket>(
    `UPDATE localities 
     SET route_id = ?, hub_id = ?, name = ?, address = ?, google_address = ?, latitude = ?, longitude = ?, city = ?, active = ?, updated_at = NOW() 
     WHERE id = ?`, // Update updated_at to NOW() when locality is updated
    [routeId, hubId, name, address, googleAddress, latitude, longitude, city, active, id]
  );
};

// Delete locality by ID
export const deleteLocalityById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM localities WHERE id = ?", [id]);
};
