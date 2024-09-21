import { db } from "../../config/databaseConnection";
import { Food } from "../../types/inventory/foodTypes";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const getAllFoods = async (
  filters: { status?: boolean; categoryId?: number; subcategoryId?: number; searchTerm?: string },
  limit: number,
  offset: number
): Promise<{ foods: Food[]; totalItems: number }> => {
  let query = "SELECT * FROM foods";
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  // Add filters
  if (filters.status !== undefined) {
    conditions.push("status = ?");
    values.push(filters.status ? 1 : 0);
  }

  if (filters.categoryId) {
    conditions.push("category_id = ?");
    values.push(filters.categoryId);
  }

  if (filters.subcategoryId) {
    conditions.push("subcategory_id = ?");
    values.push(filters.subcategoryId);
  }

  if (filters.searchTerm) {
    conditions.push("name LIKE ?");
    values.push(`%${filters.searchTerm}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Get total count query
  const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as count");
  const [countResult] = await db.promise().execute<RowDataPacket[]>(countQuery, values);
  const totalItems = countResult[0].count;

  // Append the LIMIT and OFFSET directly to the query string (no placeholders for LIMIT and OFFSET)
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  // Execute the query with filters (excluding LIMIT and OFFSET as placeholders)
  const [rows] = await db.promise().execute<RowDataPacket[]>(query, values);
  
  return { foods: rows as Food[], totalItems };
};


export const getFoodById = async (id: number): Promise<Food | null> => {
  const [rows] = await db.promise().execute<RowDataPacket[]>(
    "SELECT * FROM foods WHERE id = ?", [id]
  );
  return rows.length > 0 ? (rows[0] as Food) : null;
};

export const createFood = async (foodData: Food): Promise<Food> => {
  const query = `
        INSERT INTO foods (name, price, discount_price, description, product_type_id, 
        product_brand_id, locality_id, weightage, image, unit, sku_code, barcode, 
        cgst, sgst, category_id, subcategory_id, featured, track_inventory, restaurant_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    foodData.name,
    foodData.price,
    foodData.discount_price ?? null,
    foodData.description ?? null,
    foodData.product_type_id,
    foodData.product_brand_id,
    foodData.locality_id ?? null,
    foodData.weightage,
    foodData.image ?? null,
    foodData.unit_size ?? null,
    foodData.sku_code ?? null,
    foodData.barcode ?? null,
    foodData.cgst ?? null,
    foodData.sgst ?? null,
    foodData.category_id,
    foodData.subcategory_id ?? null,
    foodData.featured ? 1 : 0,
    foodData.track_inventory ? 1 : 0,
    foodData.restaurant_id,
    foodData.status ? 1 : 0,
  ];

  const [result] = await db.promise().execute<ResultSetHeader>(query, values);
  return { id: result.insertId, ...foodData };
};

export const updateFood = async (id: number, foodData: Food): Promise<Food | null> => {
  const query = `
        UPDATE foods SET name = ?, price = ?, discount_price = ?, description = ?, 
        product_type_id = ?, product_brand_id = ?, locality_id = ?, weightage = ?, 
        image = ?, unit = ?, sku_code = ?, barcode = ?, cgst = ?, sgst = ?, 
        category_id = ?, subcategory_id = ?, featured = ?, subscription_type = ?, 
        track_inventory = ?, restaurant_id = ?, status = ? WHERE id = ?
    `;

  const values = [
    foodData.name,
    foodData.price,
    foodData.discount_price ?? null,
    foodData.description ?? null,
    foodData.product_type_id,
    foodData.product_brand_id,
    foodData.locality_id ?? null,
    foodData.weightage,
    foodData.image ?? null,
    foodData.unit_size ?? null,
    foodData.sku_code ?? null,
    foodData.barcode ?? null,
    foodData.cgst ?? null,
    foodData.sgst ?? null,
    foodData.category_id,
    foodData.subcategory_id,
    foodData.featured ?? false,
    foodData.subscription ?? false,
    foodData.track_inventory ?? false,
    foodData.restaurant_id,
    foodData.status ?? false,
    id,
  ];

  const [result] = await db.promise().execute<ResultSetHeader>(query, values);
  return result.affectedRows > 0 ? { id, ...foodData } : null;
};

export const deleteFood = async (id: number): Promise<boolean> => {
  const [result] = await db.promise().execute<ResultSetHeader>(
    "DELETE FROM foods WHERE id = ?", [id]
  );
  return result.affectedRows > 0;
};
