import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

export const getAllBrands = async (searchTerm?: string, limit: number = 10, offset: number = 0,sortField?:string,sortOrder?:string): Promise<RowDataPacket[]> => {
  let query = "SELECT * FROM product_brands WHERE 1=1";
  const queryParams: any[] = [];

  if (searchTerm) {
    const isActive = searchTerm === 'true' ? 1 : searchTerm === 'false' ? 0 : null;

    if (isActive !== null) {
      query += " AND active = ?";
      queryParams.push(isActive);
    } else {
      query += " AND name LIKE ?";
      queryParams.push(`%${searchTerm}%`);
    }
  }

  const validSortFields = ['id','created_at', 'name', 'active']; 
  if (validSortFields.includes(sortField)) {
    query += ` ORDER BY ${sortField} ${sortOrder}`;
  } else {
    query += " ORDER BY created_at DESC";  
  }

  query += " LIMIT ? OFFSET ?";
  queryParams.push(limit, offset);

  const [rows] = await db.promise().query<RowDataPacket[]>(query, queryParams);
  return rows;
};



export const getBrandsCount = async (searchTerm?: string): Promise<number> => {
  let query = "SELECT COUNT(*) AS count FROM product_brands";
  const queryParams: any[] = [];

  if (searchTerm) {
    query += " WHERE name LIKE ? OR active = ?";
    queryParams.push(`%${searchTerm}%`, searchTerm === 'true' ? 1 : 0);
  }

  const [rows] = await db.promise().query<RowDataPacket[]>(query, queryParams);
  return rows[0]?.count ?? 0; // Use optional chaining and a default value
};

// Create a new product brand
export const createBrand = async (name: string, active: boolean = true): Promise<void> => {
  await db.promise().query<OkPacket>(
    "INSERT INTO product_brands (name, active) VALUES (?, ?)",
    [name, active]
  );
};

// Update product brand by ID
export const updateBrandById = async (id: number, name: string, active: boolean): Promise<OkPacket> => {
  const [result] = await db.promise().query<OkPacket>(
    "UPDATE product_brands SET name = ?, active = ? WHERE id = ?",
    [name, active, id]
  );
  return result; 
};


// Delete product brand by ID
export const deleteBrandById = async (id: number): Promise<OkPacket> => {
  const [result] = await db.promise().query<OkPacket>(
    "DELETE FROM product_brands WHERE id = ?",
    [id]
  );
  return result;
};

// Fetch product brand by ID
export const getBrandById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db.promise().query<RowDataPacket[]>("SELECT * FROM product_brands WHERE id = ?", [id]);
  return rows;
};
