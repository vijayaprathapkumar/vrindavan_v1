"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountOfCartItems = exports.deleteCartItemById = exports.updateCartItem = exports.getCartItemById = exports.addCartItem = exports.getAllCartItems = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all cart items for a user with pagination
const getAllCartItems = async (userId, limit, offset) => {
    const query = `
    SELECT 
      c.created_at AS created_at,
      c.id AS cart_id, 
      c.food_id, 
      c.user_id, 
      c.quantity, 
      c.updated_at,
      f.id AS food_id,
      f.name AS food_name,
      f.price,
      f.discount_price,
      f.description,
      f.perma_link,
      f.ingredients,
      f.package_items_count,
      f.weight,
      f.unit,
      f.sku_code,
      f.barcode,
      f.cgst,
      f.sgst,
      f.track_inventory,
      f.featured,
      f.deliverable,
      f.restaurant_id,
      f.category_id,
      f.subcategory_id,
      f.product_type_id,
      f.hub_id,
      f.locality_id,
      f.product_brand_id,
      f.weightage,
      f.status,
      f.food_locality,
      m.id AS media_id,
      m.model_id,
      m.file_name,
      m.mime_type,
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
    END AS original_url
    FROM 
      carts c
    JOIN 
      foods f ON c.food_id = f.id
    LEFT JOIN 
      media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      c.user_id = ?
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?; 
  `;
    const [rows] = await databaseConnection_1.db
        .promise()
        .query(query, [userId, limit, offset]);
    return rows.map((row) => ({
        id: row.cart_id,
        food_id: row.food_id,
        user_id: row.user_id,
        quantity: row.quantity,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        food: {
            id: row.food_id,
            name: row.food_name,
            price: row.price,
            discountPrice: row.discount_price,
            description: row.description,
            permaLink: row.perma_link,
            ingredients: row.ingredients,
            packageItemsCount: row.package_items_count,
            weight: row.weight,
            unit: row.unit,
            skuCode: row.sku_code,
            barcode: row.barcode,
            cgst: row.cgst,
            sgst: row.sgst,
            trackInventory: row.track_inventory,
            featured: row.featured,
            deliverable: row.deliverable,
            restaurantId: row.restaurant_id,
            categoryId: row.category_id,
            subcategoryId: row.subcategory_id,
            productTypeId: row.product_type_id,
            hubId: row.hub_id,
            localityId: row.locality_id,
            productBrandId: row.product_brand_id,
            weightage: row.weightage,
            status: row.status,
            foodLocality: row.food_locality,
            media: row.media_id
                ? {
                    media_id: row.media_id,
                    model_id: row.model_id,
                    file_name: row.file_name,
                    mime_type: row.mime_type,
                    disk: row.disk,
                    conversions_disk: row.conversions_disk,
                    size: row.size,
                    manipulations: row.manipulations,
                    custom_properties: row.custom_properties,
                    generated_conversions: row.generated_conversions,
                    responsive_images: row.responsive_images,
                    order_column: row.order_column,
                    media_created_at: row.media_created_at,
                    media_updated_at: row.media_updated_at,
                    original_url: row.original_url,
                }
                : null,
        },
    }));
};
exports.getAllCartItems = getAllCartItems;
// Add a new cart item and handle all related table insertions
const addCartItem = async (itemData) => {
    const { foodId, userId, quantity } = itemData;
    const cartSql = `
    INSERT INTO carts (food_id, user_id, quantity, created_at, updated_at) 
    VALUES (?, ?, ?, NOW(), NOW());
  `;
    const cartValues = [foodId, userId, quantity];
    try {
        const [cartResult] = await databaseConnection_1.db
            .promise()
            .query(cartSql, cartValues);
        return cartResult;
    }
    catch (error) {
        console.error("SQL Error:", error);
        throw new Error("Failed to add cart item.");
    }
};
exports.addCartItem = addCartItem;
// Fetch a cart item by ID
const getCartItemById = async (id) => {
    const query = `
    SELECT 
      c.created_at AS created_at,
      c.id AS cart_id, 
      c.food_id, 
      c.user_id, 
      c.quantity, 
      c.updated_at,
      f.id AS food_id,
      f.name AS food_name,
      f.price,
      f.discount_price,
      f.description,
      f.perma_link,
      f.ingredients,
      f.package_items_count,
      f.weight,
      f.unit,
      f.sku_code,
      f.barcode,
      f.cgst,
      f.sgst,
      f.track_inventory,
      f.featured,
      f.deliverable,
      f.restaurant_id,
      f.category_id,
      f.subcategory_id,
      f.product_type_id,
      f.hub_id,
      f.locality_id,
      f.product_brand_id,
      f.weightage,
      f.status,
      f.food_locality,
      m.id AS media_id,
      m.model_id,
      m.file_name,
      m.mime_type,
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
    END AS original_url 
    FROM 
      carts c
    JOIN 
      foods f ON c.food_id = f.id
    LEFT JOIN 
      media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      c.id = ?;
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    if (rows.length === 0) {
        return null;
    }
    const row = rows[0];
    const { cart_id, food_id, user_id, quantity, created_at: createdAt, updated_at: updatedAt, food_name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality, media_id, model_id, file_name, mime_type, disk, conversions_disk, size, manipulations, custom_properties, generated_conversions, responsive_images, order_column, media_created_at, media_updated_at, original_url, } = row;
    return {
        id: cart_id,
        food_id,
        user_id,
        quantity,
        createdAt,
        updatedAt,
        food: {
            id: food_id,
            name: food_name,
            price: price,
            discountPrice: discount_price,
            description,
            permaLink: perma_link,
            ingredients,
            packageItemsCount: package_items_count,
            weight,
            unit,
            skuCode: sku_code,
            barcode,
            cgst,
            sgst,
            trackInventory: track_inventory,
            featured,
            deliverable,
            restaurantId: restaurant_id,
            categoryId: category_id,
            subcategoryId: subcategory_id,
            productTypeId: product_type_id,
            hubId: hub_id,
            localityId: locality_id,
            productBrandId: product_brand_id,
            weightage,
            status,
            foodLocality: food_locality,
            media: {
                media_id,
                model_id,
                file_name,
                mime_type,
                disk,
                conversions_disk,
                size,
                manipulations,
                custom_properties,
                generated_conversions,
                responsive_images,
                order_column,
                media_created_at,
                media_updated_at,
                original_url
            }
        },
    };
};
exports.getCartItemById = getCartItemById;
const updateCartItem = async (id, quantity) => {
    if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero.");
    }
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid cart item ID.");
    }
    const sql = `
    UPDATE carts
    SET quantity = ?
    WHERE id = ?;
  `;
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, [quantity, id]);
        if (result.affectedRows === 0) {
            throw new Error("Failed to update cart item: Item not found.");
        }
        console.log(`Cart item with ID ${id} updated successfully.`);
    }
    catch (error) {
        console.error(`Error updating cart item with ID ${id}:`, error);
        throw new Error("Database error: Failed to update cart item.");
    }
};
exports.updateCartItem = updateCartItem;
const deleteCartItemById = async (id) => {
    // Validate the ID
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid cart item ID.");
    }
    const sql = `
    DELETE FROM carts 
    WHERE id = ?;
  `;
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, [id]);
        // Check if the delete operation was successful
        if (result.affectedRows === 0) {
            throw new Error("Cart item not found or already deleted.");
        }
        // Optionally, log the success (helpful for debugging)
        console.log(`Cart item with ID ${id} deleted successfully.`);
    }
    catch (error) {
        throw new Error("Failed to delete cart item.");
    }
};
exports.deleteCartItemById = deleteCartItemById;
const getCountOfCartItems = async (userId) => {
    const query = `
    SELECT COUNT(*) AS total
    FROM carts
    WHERE user_id = ?;
  `;
    try {
        const [rows] = await databaseConnection_1.db.promise().query(query, [userId]);
        if (rows.length === 0 || !rows[0].total) {
            return 0; // Return 0 if no result is found (just as a fallback)
        }
        return rows[0].total;
    }
    catch (error) {
        console.error("Error fetching cart item count:", error);
        throw new Error("Failed to retrieve cart item count.");
    }
};
exports.getCountOfCartItems = getCountOfCartItems;
