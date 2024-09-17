import { db } from "../../config/databaseConnection"; // Adjust the path to your database connection
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all hubs
export const getAllHubs = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>("SELECT * FROM hubs");
  return rows;
};

// Create a new hub
export const createHub = async (
  routeId: number,
  name: string,
  otherDetails: string,
  active: number
): Promise<void> => {
  await db.promise().query<OkPacket>(
    "INSERT INTO hubs (route_id, name, other_details, active) VALUES (?, ?, ?, ?)",
    [routeId, name, otherDetails, active]
  );
};

// Fetch hub by ID
export const getHubById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    "SELECT * FROM hubs WHERE id = ?", [id]
  );
  return rows;
};

// Update hub by ID
export const updateHubById = async (
  id: number,
  routeId: number,
  name: string,
  otherDetails: string,
  active: number
): Promise<void> => {
  await db.promise().query<OkPacket>(
    "UPDATE hubs SET route_id = ?, name = ?, other_details = ?, active = ? WHERE id = ?",
    [routeId, name, otherDetails, active, id]
  );
};

// Delete hub by ID
export const deleteHubById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM hubs WHERE id = ?", [id]);
};
