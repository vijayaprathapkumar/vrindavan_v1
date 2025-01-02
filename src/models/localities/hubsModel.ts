import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket, QueryResult, FieldPacket } from "mysql2";

// Fetch all hubs
export const getAllHubs = async (
  page: number,
  limit: number,
  searchTerm: string,
  sortField: string,
  sortOrder: string
): Promise<{ hubs: RowDataPacket[]; totalRecords: number }> => {
  const offset = (page - 1) * limit;

  const validSortFields: Record<string, string> = {
    hubName: "h.name",       
    truckName: "t.name",   
    other_details: "h.other_details", 
    status: "h.active", 
  };
  const sortColumn = validSortFields[sortField] || validSortFields.hubName;
  const validSortOrder = sortOrder === "DESC" ? "DESC" : "ASC";
  const hubsQuery = `
      SELECT 
        h.*, 
        t.name AS truck_route_name, 
        t.active AS truck_route_active, 
        t.created_at AS truck_route_created_at, 
        t.updated_at AS truck_route_updated_at
     FROM 
        hubs h
    LEFT JOIN truck_routes t ON 
      h.route_id = t.id WHERE h.name LIKE ?
    ORDER BY ${sortColumn} ${validSortOrder} 
    LIMIT ? OFFSET ?;
    `;
  const [hubs]: [RowDataPacket[], FieldPacket[]] = await db
    .promise()
    .query(hubsQuery, [`%${searchTerm}%`, limit, offset]);

  const countQuery = `
        SELECT COUNT(*) as total FROM hubs 
        WHERE name LIKE ?
    `;
  const [rows]: [RowDataPacket[], FieldPacket[]] = await db
    .promise()
    .query(countQuery, [`%${searchTerm}%`]);
  const total = (rows[0] as { total: number }).total;

  return { hubs, totalRecords: total };
};

// Create a new hub
export const createHub = async (
  routeId: number,
  name: string,
  otherDetails: string,
  active: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO hubs (route_id, name, other_details, active, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [routeId, name, otherDetails, active]
    );
};

// Fetch hub by ID
export const getHubById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    `SELECT 
        h.*,
          t.id AS truckRoute_id,
          t.name AS truckRoute_name,
          t.active AS truckRoute_active,
          t.created_at AS truckRoute_created_at,
          t.updated_at AS truckRoute_updated_at
      FROM hubs h
      LEFT JOIN truck_routes t ON h.route_id = t.id
      WHERE h.id = ?;`,
    [id]
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
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE hubs SET route_id = ?, name = ?, other_details = ?, active = ?, updated_at = NOW() WHERE id = ?",
      [routeId, name, otherDetails, active, id]
    );
};

// Delete hub by ID
export const deleteHubById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM hubs WHERE id = ?", [id]);
};
