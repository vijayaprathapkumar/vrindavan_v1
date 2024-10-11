import { db } from '../../config/databaseConnection';
import { RowDataPacket, OkPacket, FieldPacket } from 'mysql2';

// Fetch all truck routes, ordered by created_at
export const getAllTruckRoutes = async (page: number, limit: number, searchTerm: string): Promise<{ routes: RowDataPacket[], totalRecords: number }> => {
  const offset = (page - 1) * limit;

  const routesQuery = `
      SELECT * FROM truck_routes 
      WHERE name LIKE ? 
      ORDER BY COALESCE(updated_at, created_at) DESC 
      LIMIT ? OFFSET ?
  `;
  const [routes]: [RowDataPacket[], any] = await db.promise().query(routesQuery, [`%${searchTerm}%`, limit, offset]);

  const countQuery = `
      SELECT COUNT(*) as total FROM truck_routes 
      WHERE name LIKE ?
  `;
  const [[{ total }]]: [RowDataPacket[], any] = await db.promise().query(countQuery, [`%${searchTerm}%`]);

  return { routes, totalRecords: total };
};

// Create a new truck route
export const createTruckRoute = async (name: string, active: number): Promise<void> => {
  await db.promise().query<OkPacket>(
    "INSERT INTO truck_routes (name, active, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
    [name, active] // active should be 0 or 1
  );
};

// Fetch truck route by ID
export const getTruckRouteById = async (id: number): Promise<RowDataPacket | null> => {
  const [rows]: [RowDataPacket[], FieldPacket[]] = await db.promise().query<RowDataPacket[]>(
    "SELECT * FROM truck_routes WHERE id = ?",
    [id]
  );
  return rows.length > 0 ? rows[0] : null; 
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
