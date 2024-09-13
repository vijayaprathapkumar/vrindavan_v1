import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Fetch all foods
export const getAllFoods = async (): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM foods");
  return rows;
};

// Create a new food
export const createFood = async (
  name: string,
  price: number,
  discount_price: number,
  description: string,
  perma_link: string,
  ingredients: string,
  package_items_count: number,
  weight: number,
  unit: string,
  sku_code: string,
  barcode: string,
  cgst: string,
  sgst: string,
  subscription_type: string,
  track_inventory: string,
  featured: boolean,
  deliverable: boolean,
  restaurant_id: number,
  category_id: number,
  subcategory_id: number | null,
  product_type_id: number | null,
  hub_id: number | null,
  locality_id: number | null,
  product_brand_id: number | null,
  weightage: number | null,
  status: string,
  food_locality: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      `INSERT INTO foods (name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality]
    );
};

// Fetch food by ID
export const getFoodById = async (id: number): Promise<RowDataPacket[]> => {
  const [rows] = await db
    .promise()
    .query<RowDataPacket[]>("SELECT * FROM foods WHERE id = ?", [id]);
  return rows;
};

// Update food by ID
export const updateFoodById = async (
  id: number,
  name: string,
  price: number,
  discount_price: number,
  description: string,
  perma_link: string,
  ingredients: string,
  package_items_count: number,
  weight: number,
  unit: string,
  sku_code: string,
  barcode: string,
  cgst: string,
  sgst: string,
  subscription_type: string,
  track_inventory: string,
  featured: boolean,
  deliverable: boolean,
  restaurant_id: number,
  category_id: number,
  subcategory_id: number | null,
  product_type_id: number | null,
  hub_id: number | null,
  locality_id: number | null,
  product_brand_id: number | null,
  weightage: number | null,
  status: string,
  food_locality: number
): Promise<void> => {
  await db
    .promise()
    .query<OkPacket>(
      `UPDATE foods SET name = ?, price = ?, discount_price = ?, description = ?, perma_link = ?, ingredients = ?, package_items_count = ?, weight = ?, unit = ?, sku_code = ?, barcode = ?, cgst = ?, sgst = ?, subscription_type = ?, track_inventory = ?, featured = ?, deliverable = ?, restaurant_id = ?, category_id = ?, subcategory_id = ?, product_type_id = ?, hub_id = ?, locality_id = ?, product_brand_id = ?, weightage = ?, status = ?, food_locality = ? WHERE id = ?`,
      [name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality, id]
    );
};

// Delete food by ID
export const deleteFoodById = async (id: number): Promise<void> => {
  await db.promise().query<OkPacket>("DELETE FROM foods WHERE id = ?", [id]);
};
