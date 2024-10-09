import { db } from "../../config/databaseConnection";
import { Food, Media } from "../../types/inventory/foodTypes";
import { RowDataPacket, ResultSetHeader } from "mysql2";


export const getAllFoods = async (
  filters: {
    status?: boolean;
    categoryId?: number;
    subcategoryId?: number;
    searchTerm?: string;
  },
  limit: number,
  offset: number
): Promise<{ foods: Food[]; media: Media[]; totalItems: number }> => {
  let query = `
    SELECT f.*, 
           m.id AS media_id,
           m.model_type,
           m.model_id,
           m.uuid,
           m.collection_name,
           m.name AS media_name,
           m.file_name AS media_file_name,
           m.mime_type AS media_mime_type,
           m.disk,
           m.conversions_disk,
           m.size,
           m.manipulations,
           m.custom_properties,
           m.generated_conversions,
           m.responsive_images,
           m.order_column,
           m.created_at AS media_created_at,
           m.updated_at AS media_updated_at,
           CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM foods f
    LEFT JOIN media m ON f.id = m.model_id
  `;

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.status !== undefined) {
    conditions.push("f.status = ?");
    values.push(filters.status ? 1 : 0);
  }

  if (filters.categoryId !== undefined) {
    conditions.push("f.category_id = ?");
    values.push(filters.categoryId);
  }

  if (filters.subcategoryId !== undefined) {
    conditions.push("f.subcategory_id = ?");
    values.push(filters.subcategoryId);
  }

  if (filters.searchTerm) {
    conditions.push("f.name LIKE ?");
    values.push(`%${filters.searchTerm}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const countQuery = `
    SELECT COUNT(*) as count 
    FROM foods f
    ${conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""}
  `;

  const [countResult] = await db.promise().execute<RowDataPacket[]>(countQuery, values);
  const totalItems = countResult[0].count;

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await db.promise().execute<RowDataPacket[]>(query, values);

  const foods: Food[] = [];
  const media: Media[] = [];

  rows.forEach(row => {
    foods.push(row as Food);

    if (row.media_id) {
      media.push({
        id: row.media_id,
        model_type: row.model_type,
        model_id: row.model_id,
        uuid: row.uuid,
        collection_name: row.collection_name,
        name: row.media_name,
        file_name: row.media_file_name,
        mime_type: row.media_mime_type,
        disk: row.disk,
        conversions_disk: row.conversions_disk,
        size: row.size,
        manipulations: row.manipulations,
        custom_properties: row.custom_properties,
        generated_conversions: row.generated_conversions,
        responsive_images: row.responsive_images,
        order_column: row.order_column,
        created_at: row.media_created_at,
        updated_at: row.media_updated_at,
        original_url: row.original_url,
      } as Media);
    }
  });

  return { foods, media, totalItems };
};




export const getFoodById = async (id: number): Promise<{ food: Food | null; media: Media[] }> => {
  const [rows] = await db
    .promise()
    .execute<RowDataPacket[]>(`
      SELECT f.*, 
             m.id AS media_id,
             m.model_type,
             m.model_id,
             m.uuid,
             m.collection_name,
             m.name AS media_name,
             m.file_name AS media_file_name,
             m.mime_type AS media_mime_type,
             m.disk,
             m.conversions_disk,
             m.size,
             m.manipulations,
             m.custom_properties,
             m.generated_conversions,
             m.responsive_images,
             m.order_column,
             m.created_at AS media_created_at,
             m.updated_at AS media_updated_at
      FROM foods f
      LEFT JOIN media m ON f.id = m.model_id
      WHERE f.id = ?`,
      [id]
    );

  const food = rows.length > 0 ? (rows[0] as Food) : null;

  const media: Media[] = rows.map(row => ({
    id: row.media_id,
    model_type: row.model_type,
    model_id: row.model_id,
    uuid: row.uuid,
    collection_name: row.collection_name,
    name: row.media_name,
    file_name: row.media_file_name,
    mime_type: row.media_mime_type,
    disk: row.disk,
    conversions_disk: row.conversions_disk,
    size: row.size,
    manipulations: row.manipulations,
    custom_properties: row.custom_properties,
    generated_conversions: row.generated_conversions,
    responsive_images: row.responsive_images,
    order_column: row.order_column,
    created_at: row.media_created_at,
    updated_at: row.media_updated_at,
    original_url: `https://vrindavanmilk.com/storage/app/public/${row.media_id}/${row.media_file_name}`,
  })).filter(m => m.id);

  return { food, media };
};


const defaultRestaurant_id = 1;

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
    defaultRestaurant_id,
    foodData.status ? 1 : 0,
  ];

  const [result] = await db.promise().execute<ResultSetHeader>(query, values);
  return { id: result.insertId, ...foodData };
};

export const updateFood = async (
  id: number,
  foodData: Food
): Promise<Food | null> => {
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
    defaultRestaurant_id,
    foodData.status ?? false,
    id,
  ];

  const [result] = await db.promise().execute<ResultSetHeader>(query, values);
  return result.affectedRows > 0 ? { id, ...foodData } : null;
};

export const deleteFood = async (id: number): Promise<boolean> => {
  const [result] = await db
    .promise()
    .execute<ResultSetHeader>("DELETE FROM foods WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
