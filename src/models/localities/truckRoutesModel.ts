import { db } from '../../config/databaseConnection';
import { RowDataPacket, OkPacket } from 'mysql2';

// Fetch all truck routes, ordered by created_at
export const getAllTruckRoutes = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    "SELECT * FROM truck_routes ORDER BY created_at DESC"
  );
  return rows;
};

// Create a new truck route
export const createTruckRoute = async (name: string, active: number): Promise<void> => {
  await db.promise().query<OkPacket>(
    "INSERT INTO truck_routes (name, active, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
    [name, active]
  );
};

// Fetch truck route by ID
export const getTruckRouteById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    "SELECT * FROM truck_routes WHERE id = ?",
    [id]
  );
  return rows;
};

// Update truck route by ID
export const updateTruckRouteById = async (id: number, name: string, active: number): Promise<void> => {
  await db.promise().query<OkPacket>(
    "UPDATE truck_routes SET name = ?, active = ?, updated_at = NOW() WHERE id = ?",
    [name, active, id]
  );
};

// Delete truck route by ID
export const deleteTruckRouteById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>(
    "DELETE FROM truck_routes WHERE id = ?",
    [id]
  );
};
