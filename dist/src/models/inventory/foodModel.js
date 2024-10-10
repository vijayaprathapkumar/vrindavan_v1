"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFood = exports.updateFood = exports.createFood = exports.getFoodById = exports.getAllFoods = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
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
    const totalItems = countResult[0].count;
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await databaseConnection_1.db.promise().execute(query, values);
    const foods = [];
    const media = [];
    rows.forEach(row => {
        foods.push(row);
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
            });
        }
    });
    return { foods, media, totalItems };
};
exports.getAllFoods = getAllFoods;
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
        Media_id: row.media_id,
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
        .filter(m => m.Media_id)
        .sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return { food, media };
};
exports.getFoodById = getFoodById;
const defaultRestaurant_id = 1;
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
        foodData.restaurant_id, // Required field
        foodData.category_id, // Required field
        foodData.subcategory_id ?? null,
        foodData.product_type_id ?? null,
        foodData.hub_id ?? null,
        foodData.locality_id ?? null,
        foodData.product_brand_id ?? null,
        foodData.weightage ?? null,
        foodData.status ?? null,
        new Date(), // created_at
        new Date(), // updated_at
        foodData.food_locality ?? null // Optional field
    ];
    try {
        const [result] = await databaseConnection_1.db.promise().execute(query, values);
        return { id: result.insertId, ...foodData }; // Return the new food item with its ID
    }
    catch (error) {
        // Handle errors accordingly (you can log the error or throw it)
        console.error("Error inserting food:", error);
        throw new Error("Database insert failed");
    }
};
exports.createFood = createFood;
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
    // Map foodData from camelCase to snake_case
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
        foodData.track_inventory ?? false,
        foodData.featured ?? false,
        foodData.deliverable ?? false,
        foodData.restaurant_id ?? null,
        foodData.category_id ?? null,
        foodData.subcategory_id ?? null,
        foodData.product_type_id ?? null,
        foodData.hub_id ?? null,
        foodData.locality_id ?? null,
        foodData.product_brand_id ?? null,
        foodData.weightage ?? null,
        foodData.status ?? null,
        id,
    ];
    const [result] = await databaseConnection_1.db.promise().execute(query, values);
    return result.affectedRows > 0 ? { id, ...foodData } : null;
};
exports.updateFood = updateFood;
const deleteFood = async (id) => {
    const [result] = await databaseConnection_1.db
        .promise()
        .execute("DELETE FROM foods WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
exports.deleteFood = deleteFood;
