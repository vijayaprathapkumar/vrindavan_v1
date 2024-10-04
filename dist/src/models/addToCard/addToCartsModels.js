"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCartItemById = exports.updateCartItem = exports.addCartItem = exports.getAllCartItems = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all cart items for a user
const getAllCartItems = async (userId) => {
    const query = `
      SELECT 
        c.id AS cart_id, 
        c.food_id, 
        c.user_id, 
        c.quantity, 
        c.created_at, 
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
        f.image
      FROM 
        carts c
      JOIN 
        foods f ON c.food_id = f.id
      WHERE 
        c.user_id = ?;
    `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [userId]);
    return rows.map(row => ({
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
            image: row.image,
        }
    }));
};
exports.getAllCartItems = getAllCartItems;
// Add a new cart item
const addCartItem = async (itemData) => {
    const { foodId, userId, quantity } = itemData;
    const sql = `
      INSERT INTO carts (food_id, user_id, quantity, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW());
    `;
    const values = [foodId, userId, quantity];
    try {
        const [result] = await databaseConnection_1.db.promise().query(sql, values);
        return result;
    }
    catch (error) {
        console.error("SQL Error:", error);
        throw new Error("Failed to add cart item.");
    }
};
exports.addCartItem = addCartItem;
// Update a cart item
const updateCartItem = async (id, quantity) => {
    const sql = `
    UPDATE carts
    SET quantity = ?
    WHERE id = ?;
  `;
    const [result] = await databaseConnection_1.db.promise().query(sql, [quantity, id]);
    if (result.affectedRows === 0) {
        throw new Error("Failed to update cart item or item not found.");
    }
};
exports.updateCartItem = updateCartItem;
// Delete a cart item by ID
const deleteCartItemById = async (id) => {
    const sql = `
    DELETE FROM carts 
    WHERE id = ?;
  `;
    await databaseConnection_1.db.promise().query(sql, [id]);
};
exports.deleteCartItemById = deleteCartItemById;
