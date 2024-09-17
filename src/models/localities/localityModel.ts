import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all localities
export const getAllLocalities = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    `SELECT localities.*, hubs.name as hub_name 
     FROM localities 
     LEFT JOIN hubs ON localities.hub_id = hubs.id`
  );
  return rows;
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
      (route_id, hub_id, name, address, google_address, latitude, longitude, city, active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
     SET route_id = ?, hub_id = ?, name = ?, address = ?, google_address = ?, latitude = ?, longitude = ?, city = ?, active = ? 
     WHERE id = ?`,
    [routeId, hubId, name, address, googleAddress, latitude, longitude, city, active, id]
  );
};

// Delete locality by ID
export const deleteLocalityById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM localities WHERE id = ?", [id]);
};