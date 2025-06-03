import { db } from "../../config/databaseConnection";
import { Food, Media } from "../../types/inventory/foodTypes";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const getAllFoods = async (
  filters: {
    status?: number;
    categoryId?: number;
    subcategoryId?: number;
    searchTerm?: string;
  },
  limit: number,
  offset: number,
  sortField?: string,
  sortOrder?: string
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
           CASE 
              WHEN m.conversions_disk = 'public1' 
              THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
              ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
           END AS original_url,
           CASE 
  WHEN f.track_inventory = 1 THEN '-' 
  ELSE COALESCE((SELECT SUM(amount) FROM stock_mutations WHERE stockable_id = f.id), 0)
END AS outOfStock

    FROM foods f
    LEFT JOIN media m ON f.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Food')
  `;

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.status !== undefined && filters.status !== null) {
    conditions.push("f.status = ?");
    values.push(filters.status);
  }

  if (filters.categoryId) {
    conditions.push("f.category_id = ?");
    values.push(filters.categoryId);
  }

  if (filters.subcategoryId) {
    conditions.push("f.subcategory_id = ?");
    values.push(filters.subcategoryId);
  }

  if (filters.searchTerm) {
    conditions.push(
      "(f.name LIKE ? OR f.unit LIKE ? OR f.id LIKE ? OR f.price LIKE ? OR f.discount_price LIKE ? OR f.weightage LIKE ?)"
    );
    values.push(
      `%${filters.searchTerm}%`,
      `%${filters.searchTerm}%`,
      `%${filters.searchTerm}%`,
      `%${filters.searchTerm}%`,
      `%${filters.searchTerm}%`,
      `%${filters.searchTerm}%`
    );
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const validSortFields: Record<string, string> = {
    _id: "f.id",
    name: "f.name",
    track_inventory: "f.track_inventory",
    price: "f.price",
    unit: "f.unit",
    discount_price: "f.discount_price",
    size: "f.size",
    weightage: "CAST(f.weightage AS UNSIGNED)",
  };

  query += ` ORDER BY 
    CASE 
      WHEN (SELECT SUM(amount) FROM stock_mutations WHERE stockable_id = f.id) <= 0 THEN 1 
      ELSE 0 
    END,
    ${
      sortField && validSortFields[sortField]
        ? validSortFields[sortField]
        : "CAST(f.weightage AS UNSIGNED)"
    } ${sortOrder === "desc" ? "DESC" : "ASC"}
  `;

  const countQuery = `
    SELECT COUNT(*) as count 
    FROM foods f
    ${conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""}
  `;

  const [countResult] = await db
    .promise()
    .execute<RowDataPacket[]>(countQuery, values);
  const totalCount = countResult[0].count;

  if (limit && limit > 0) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  const [rows] = await db.promise().execute<RowDataPacket[]>(query, values);

  // Construct the final foods array
  const foods: Food[] = rows.map((row) => {
    return {
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
      outOfStock: row.outOfStock ,   
      media: row.media_id
        ? [
            {
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
            },
          ]
        : [],
    } as Food;
  });

  return { foods, totalCount };
};

// Fetch a single food by ID
export const getFoodById = async (
  id: number
): Promise<{ food: Food | null }> => {
  const [rows] = await db.promise().execute<RowDataPacket[]>(
    `
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
            CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url,
             (SELECT SUM(amount) FROM stock_mutations  WHERE  stockable_id = f.id) AS outOfStock
      FROM foods f
      LEFT JOIN media m ON f.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Food')
      WHERE f.id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return { food: null };
  }

  const foodData = rows[0];

  const food: Food & { media: Media[] } = {
    id: foodData.id,
    name: foodData.name,
    price: foodData.price,
    discount_price: foodData.discount_price,
    description: foodData.description
      ? foodData.description.replace(/<\/?[^>]+(>|$)/g, "")
      : null,
    ingredients: foodData.ingredients,
    package_items_count: foodData.package_items_count,
    weight: foodData.weight,
    unit: foodData.unit,
    sku_code: foodData.sku_code,
    barcode: foodData.barcode,
    cgst: foodData.cgst,
    sgst: foodData.sgst,
    subscription_type: foodData.subscription_type,
    track_inventory: foodData.track_inventory,
    featured: foodData.featured,
    deliverable: foodData.deliverable,
    restaurant_id: foodData.restaurant_id,
    category_id: foodData.category_id,
    subcategory_id: foodData.subcategory_id,
    product_type_id: foodData.product_type_id,
    hub_id: foodData.hub_id,
    locality_id: foodData.locality_id,
    product_brand_id: foodData.product_brand_id,
    weightage: foodData.weightage,
    status: foodData.status,
    created_at: foodData.created_at,
    updated_at: foodData.updated_at,
    outOfStock: foodData.outOfStock,
    media: [],
  };

  rows.forEach((row) => {
    if (row.media_id) {
      food.media.push({
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

  return { food };
};

// Create a new food item
export const createFood = async (foodData: Food): Promise<number> => {
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
    foodData.food_locality ?? null,
  ];

  try {
    const [result] = await db.promise().execute<ResultSetHeader>(query, values);
    return result.insertId;
  } catch (error) {
    console.error("Error inserting food:", error);
    throw new Error("Database insert failed");
  }
};

// Update an existing food item by ID
export const updateFood = async (
  id: number,
  foodData: Food
): Promise<Food | null> => {
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
    id,
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

export const updateStock = async (
  foodId: number,
  amountChange: number,
  stockableType: string,
  description?: string
): Promise<void> => {
  try {
    const [existing] = await db
      .promise()
      .execute("SELECT id FROM stock_mutations WHERE stockable_id = ?", [
        foodId,
      ]);

    if ((existing as any[]).length === 0) {
      const insertQuery = `
        INSERT INTO stock_mutations (stockable_id, stockable_type, amount, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      await db
        .promise()
        .execute(insertQuery, [
          foodId,
          stockableType,
          amountChange,
          description ?? null,
        ]);
    } else {
      const updateQuery = `
        UPDATE stock_mutations
        SET amount = amount + ?, 
            description = ?, 
            updated_at = NOW()
        WHERE stockable_id = ?
      `;
      const [result] = await db
        .promise()
        .execute<ResultSetHeader>(updateQuery, [
          amountChange,
          description ?? null,
          foodId,
        ]);

      if (result.affectedRows === 0) {
        throw new Error("No record found with the specified stockable_id");
      }
    }
  } catch (error) {
    console.error("Error updating stock:", error);
    throw new Error("Stock update failed");
  }
};
