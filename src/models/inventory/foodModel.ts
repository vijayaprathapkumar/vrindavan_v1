import { db } from "../../config/databaseConnection";
import { Food, Media } from "../../types/inventory/foodTypes";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// Fetch all foods with filters, pagination, and total items count
export const getAllFoods = async (
  filters: {
    status?: boolean;
    categoryId?: number;
    subcategoryId?: number;
    searchTerm?: string;
  },
  limit: number,
  offset: number
): Promise<{ foods: Food[]; totalCount: number }> => {
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
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
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
    conditions.push("(f.name LIKE ? OR f.unit LIKE ?)");
    values.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
}

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY f.created_at DESC";

  const countQuery = `
    SELECT COUNT(*) as count 
    FROM foods f
    ${conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""}
  `;

  const [countResult] = await db.promise().execute<RowDataPacket[]>(countQuery, values);
  const totalCount = countResult[0].count;

  query += ` LIMIT ${limit} OFFSET ${offset}`;

  const [rows] = await db.promise().execute<RowDataPacket[]>(query, values);

  // Create a mapping of foods to their media
  const foodMap: { [key: number]: Food & { media: Media[] } } = {};

  rows.forEach(row => {
    const foodId = row.id;

    if (!foodMap[foodId]) {
      foodMap[foodId] = {
        id: row.id,
        name: row.name,
        price: row.price,
        discount_price: row.discount_price,
        description: row.description,
        ingredients: row.ingredients,
        package_items_count: row.package_items_count,
        weight: row.weight,
        unit: row.unit,
        sku_code: row.sku_code,
        barcode: row.barcode,
        cgst: row.cgst,
        sgst: row.sgst,
        subscription_type: row.subscription_type,
        track_inventory: row.track_inventory,
        featured: row.featured,
        deliverable: row.deliverable,
        restaurant_id: row.restaurant_id,
        category_id: row.category_id,
        subcategory_id: row.subcategory_id,
        product_type_id: row.product_type_id,
        hub_id: row.hub_id,
        locality_id: row.locality_id,
        product_brand_id: row.product_brand_id,
        weightage: row.weightage,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        media: [], // Initialize an empty media array
      };
    }

    // If media_id is present, add the media to the corresponding food
    if (row.media_id) {
      foodMap[foodId].media.push({
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
  
  // Convert the foodMap object back to an array
  const foods: Food[] = Object.values(foodMap);

  return { foods, totalCount };
};


// Fetch a single food by ID
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
      LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
      WHERE f.id = ?`,
      [id]
    );

  const food = rows.length > 0 ? (rows[0] as Food) : null;

  const media: Media[] = rows
    .map(row => ({
      id: row.media_id,
      model_type: row.model_type,
      model_id: row.model_id,
      uuid: row.uuid,
      collection_name: row.collection_name,
      name: row.media_name,
      file_name: row.media_file_name,
      mime_type: row.mime_type,
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
    }))
    .filter(m => m.id)
    .sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return { food, media };
};

// Create a new food item
export const createFood = async (foodData: Food): Promise<Food> => {
  const query = `
    INSERT INTO foods (
      name, price, discount_price, description, 
      perma_link, ingredients, package_items_count, weight,
      unit, sku_code, barcode, cgst, sgst, 
      subscription_type, track_inventory, featured, 
      deliverable, restaurant_id, category_id, 
      subcategory_id, product_type_id, hub_id, locality_id,
      product_brand_id, weightage, status, created_at, 
      updated_at, food_locality
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

  const values = [
    foodData.name,
    foodData.price,
    foodData.discount_price ?? null,
    foodData.description ?? null,
    foodData.perma_link ?? null,
    foodData.ingredients ?? null,
    foodData.package_items_count ?? null,
    foodData.weight ?? null,
    foodData.unit ?? null,
    foodData.sku_code ?? null,
    foodData.barcode ?? null,
    foodData.cgst ?? null,
    foodData.sgst ?? null,
    foodData.subscription_type ?? null,
    foodData.track_inventory ?? null,
    foodData.featured ? 1 : 0,
    foodData.deliverable ? 1 : 0,
    foodData.restaurant_id, 
    foodData.category_id,    
    foodData.subcategory_id ?? null,
    foodData.product_type_id ?? null,
    foodData.hub_id ?? null,
    foodData.locality_id ?? null,
    foodData.product_brand_id ?? null,
    foodData.weightage ?? null,
    foodData.status ?? null,
    new Date(), 
    new Date(), 
    foodData.food_locality ?? null 
  ];

  try {
    const [result] = await db.promise().execute<ResultSetHeader>(query, values);
    return { id: result.insertId, ...foodData }; 
  } catch (error) {
    console.error("Error inserting food:", error);
    throw new Error("Database insert failed");
  }
};

// Update an existing food item by ID
export const updateFood = async (id: number, foodData: Food): Promise<Food | null> => {
  const query = `
    UPDATE foods SET name = ?, price = ?, discount_price = ?, description = ?, 
    perma_link = ?, ingredients = ?, package_items_count = ?, weight = ?, 
    unit = ?, sku_code = ?, barcode = ?, cgst = ?, sgst = ?, 
    subscription_type = ?, track_inventory = ?, featured = ?, deliverable = ?, 
    restaurant_id = ?, category_id = ?, subcategory_id = ?, product_type_id = ?, 
    hub_id = ?, locality_id = ?, product_brand_id = ?, weightage = ?, 
    status = ?, updated_at = NOW() WHERE id = ?
  `;

  const values = [
    foodData.name,
    foodData.price,
    foodData.discount_price ?? null, 
    foodData.description ?? null,
    foodData.perma_link ?? null,
    foodData.ingredients ?? null,
    foodData.package_items_count ?? null,
    foodData.weight ?? null,
    foodData.unit ?? null,
    foodData.sku_code ?? null,
    foodData.barcode ?? null,
    foodData.cgst ?? null,
    foodData.sgst ?? null,
    foodData.subscription_type ?? null,
    foodData.track_inventory ?? null,
    foodData.featured ? 1 : 0,
    foodData.deliverable ? 1 : 0,
    foodData.restaurant_id, 
    foodData.category_id,    
    foodData.subcategory_id ?? null,
    foodData.product_type_id ?? null,
    foodData.hub_id ?? null,
    foodData.locality_id ?? null,
    foodData.product_brand_id ?? null,
    foodData.weightage ?? null,
    foodData.status ?? null,
    id
  ];

  try {
    const [result] = await db.promise().execute<ResultSetHeader>(query, values);
    return result.affectedRows > 0 ? { id, ...foodData } : null;
  } catch (error) {
    console.error("Error updating food:", error);
    throw new Error("Database update failed");
  }
};

// Delete a food item by ID
export const deleteFood = async (id: number): Promise<boolean> => {
  const query = `DELETE FROM foods WHERE id = ?`;
  const [result] = await db.promise().execute<ResultSetHeader>(query, [id]);
  return result.affectedRows > 0;
};
