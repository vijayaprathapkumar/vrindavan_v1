"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFoodById = exports.updateFoodById = exports.getFoodById = exports.createFood = exports.getAllFoods = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all foods
const getAllFoods = async () => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM foods");
    return rows;
};
exports.getAllFoods = getAllFoods;
// Create a new food
const createFood = async (name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality) => {
    await databaseConnection_1.db
        .promise()
        .query(`INSERT INTO foods (name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality]);
};
exports.createFood = createFood;
// Fetch food by ID
const getFoodById = async (id) => {
    const [rows] = await databaseConnection_1.db
        .promise()
        .query("SELECT * FROM foods WHERE id = ?", [id]);
    return rows;
};
exports.getFoodById = getFoodById;
// Update food by ID
const updateFoodById = async (id, name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality) => {
    await databaseConnection_1.db
        .promise()
        .query(`UPDATE foods SET name = ?, price = ?, discount_price = ?, description = ?, perma_link = ?, ingredients = ?, package_items_count = ?, weight = ?, unit = ?, sku_code = ?, barcode = ?, cgst = ?, sgst = ?, subscription_type = ?, track_inventory = ?, featured = ?, deliverable = ?, restaurant_id = ?, category_id = ?, subcategory_id = ?, product_type_id = ?, hub_id = ?, locality_id = ?, product_brand_id = ?, weightage = ?, status = ?, food_locality = ? WHERE id = ?`, [name, price, discount_price, description, perma_link, ingredients, package_items_count, weight, unit, sku_code, barcode, cgst, sgst, subscription_type, track_inventory, featured, deliverable, restaurant_id, category_id, subcategory_id, product_type_id, hub_id, locality_id, product_brand_id, weightage, status, food_locality, id]);
};
exports.updateFoodById = updateFoodById;
// Delete food by ID
const deleteFoodById = async (id) => {
    await databaseConnection_1.db.promise().query("DELETE FROM foods WHERE id = ?", [id]);
};
exports.deleteFoodById = deleteFoodById;
