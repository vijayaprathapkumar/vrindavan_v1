"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFood = exports.updateFood = exports.createFood = exports.getFoodById = exports.getAllFoods = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all foods with filters, pagination, and total items count
const getAllFoods = async (filters, limit, offset) => {
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
    const conditions = [];
    const values = [];
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
    query += " ORDER BY f.created_at DESC";
    const countQuery = `
    SELECT COUNT(*) as count 
    FROM foods f
    ${conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""}
  `;
    const [countResult] = await databaseConnection_1.db.promise().execute(countQuery, values);
    const totalCount = countResult[0].count;
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await databaseConnection_1.db.promise().execute(query, values);
    // Create a mapping of foods to their media
    const foodMap = {};
    rows.forEach(row => {
        const foodId = row.id;
        if (!foodMap[foodId]) {
            foodMap[foodId] = {
                id: row.id,
                name: row.name,
                description: row.description,
                weightage: row.weightage,
                status: row.status,
                category_id: row.category_id,
                price: row.price, // Include the price
                restaurant_id: row.restaurant_id,
                subcategory_id: row.subcategory_id,
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
            });
        }
    });
    // Convert the foodMap object back to an array
    const foods = Object.values(foodMap);
    return { foods, totalCount };
};
exports.getAllFoods = getAllFoods;
// Fetch a single food by ID
const getFoodById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .execute(`
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
      WHERE f.id = ?`, [id]);
    const food = rows.length > 0 ? rows[0] : null;
    const media = rows
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
exports.getFoodById = getFoodById;
// Create a new food item
const createFood = async (foodData) => {
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
        const [result] = await databaseConnection_1.db.promise().execute(query, values);
        return { id: result.insertId, ...foodData };
    }
    catch (error) {
        console.error("Error inserting food:", error);
        throw new Error("Database insert failed");
    }
};
exports.createFood = createFood;
// Update an existing food item by ID
const updateFood = async (id, foodData) => {
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
        const [result] = await databaseConnection_1.db.promise().execute(query, values);
        return result.affectedRows > 0 ? { id, ...foodData } : null;
    }
    catch (error) {
        console.error("Error updating food:", error);
        throw new Error("Database update failed");
    }
};
exports.updateFood = updateFood;
// Delete a food item by ID
const deleteFood = async (id) => {
    const query = `DELETE FROM foods WHERE id = ?`;
    const [result] = await databaseConnection_1.db.promise().execute(query, [id]);
    return result.affectedRows > 0;
};
exports.deleteFood = deleteFood;
