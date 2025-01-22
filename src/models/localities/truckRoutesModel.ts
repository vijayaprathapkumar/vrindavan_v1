import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket, FieldPacket } from "mysql2";

// Fetch all truck routes, ordered by created_at
export const getAllTruckRoutes = async (
  page: number,
  limit: number,
  searchTerm: string,
  sortField?: string,
  sortOrder?: string
): Promise<{ routes: RowDataPacket[]; totalRecords: number }> => {
  const offset = (page - 1) * limit;

  // Define valid sort fields to prevent SQL injection
  const validSortFields: Record<string, string> = {
    name: "name",
    active: "active",
  };

  // Validate sort field and order
  const validSortOrders = ["asc", "desc"];
  const validatedSortField = validSortFields[sortField] || "created_at";
  const validatedSortOrder = validSortOrders.includes(sortOrder?.toLowerCase() || "")
    ? sortOrder.toLowerCase()
    : "asc";

  let whereClause = "WHERE 1=1"; 
  const params: any[] = [];

  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm === "active") {
      whereClause += " AND active = ?";
      params.push(1);
    } else if (lowerSearchTerm === "inactive") {
      whereClause += " AND active = ?";
      params.push(0);
    } else {
      whereClause += " AND name LIKE ?";
      params.push(`%${searchTerm}%`);
    }
  }

  const routesQuery = `
    SELECT * FROM truck_routes 
    ${whereClause}
    ORDER BY ${validatedSortField} ${validatedSortOrder} 
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const [routes]: [RowDataPacket[], any] = await db.promise().query(routesQuery, params);

  // Count query for total records
  const countQuery = `
    SELECT COUNT(*) as total FROM truck_routes 
    ${whereClause}
  `;

  const [[{ total }]]: [RowDataPacket[], any] = await db.promise().query(countQuery, params.slice(0, -2));

  return { routes, totalRecords: total };
};


// Create a new truck route
export const createTruckRoute = async (
  name: string,
  active: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "INSERT INTO truck_routes (name, active, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [name, active]
    );
};

// Fetch truck route by ID
export const getTruckRouteById = async (
  id: number
): Promise<RowDataPacket | null> => {
  const [rows]: [RowDataPacket[], FieldPacket[]] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM truck_routes WHERE id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
};

// Update truck route by ID
export const updateTruckRouteById = async (
  id: number,
  name: string,
  active: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      "UPDATE truck_routes SET name = ?, active = ?, updated_at = NOW() WHERE id = ?",
      [name, active, id]
    );
};

// Delete truck route by ID
export const deleteTruckRouteById = async (id: number): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>("DELETE FROM truck_routes WHERE id = ?", [id]);
};
