"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryById = exports.updateCategoryById = exports.getCategoryById = exports.createCategory = exports.getCategoriesCount = exports.getAllCategories = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all categories with limit and offset for pagination
const getAllCategories = async (limit, offset, searchTerm, sortField, sortOrder) => {
    const validSortFields = {
        name: "c.name",
        weightage: "CAST(c.weightage AS UNSIGNED)",
        updated_at: "c.updated_at",
    };
    const sortColumn = validSortFields[sortField] || validSortFields["name"];
    const orderDirection = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";
    let query = `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      c.description,
      c.weightage,
      c.created_at,
      c.updated_at,
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
            CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/category/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM 
      categories c
    LEFT JOIN 
      media m ON c.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Category')
    WHERE 
      (c.name LIKE ? OR CAST(c.weightage AS CHAR) = ?)
    ORDER BY ${sortColumn} ${orderDirection}
    LIMIT ? OFFSET ?
  `;
    const params = [`%${searchTerm}%`, searchTerm, limit, offset];
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    const countQuery = `
    SELECT COUNT(*) AS total
    FROM categories c
    LEFT JOIN media m ON c.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Category')
    WHERE (c.name LIKE ? OR CAST(c.weightage AS CHAR) = ?)
  `;
    const [countResult] = await databaseConnection_1.db.promise().query(countQuery, [`%${searchTerm}%`, searchTerm]);
    const total = countResult[0].total;
    return { rows, total };
};
exports.getAllCategories = getAllCategories;
// Fetch total count of categories that match the search term
const getCategoriesCount = async (searchTerm) => {
    const query = `
    SELECT COUNT(*) as count FROM categories 
    WHERE name LIKE ? OR weightage = ?
  `;
    const params = [`%${searchTerm}%`, parseInt(searchTerm) || -1];
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    return rows[0].count;
};
exports.getCategoriesCount = getCategoriesCount;
// Create a new category
const createCategory = async (name, description, weightage) => {
    const query = `
      INSERT INTO categories (name, description, weightage, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
  `;
    const params = [name, description, weightage];
    const [result] = await databaseConnection_1.db.promise().query(query, params);
    return result.insertId;
};
exports.createCategory = createCategory;
const getCategoryById = async (id) => {
    const query = `
    SELECT 
      c.id AS category_id,
      c.name AS category_name,
      c.description,
      c.weightage,
      c.created_at AS category_created_at,
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
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/category/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM 
      categories c
    LEFT JOIN 
      media m ON c.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Category')
    WHERE 
      c.id = ? 
  `;
    const [rows] = await databaseConnection_1.db.promise().query(query, [id]);
    return rows;
};
exports.getCategoryById = getCategoryById;
// Update category by ID (with optional image)
const updateCategoryById = async (id, name, description, weightage) => {
    let query = "UPDATE categories SET name = ?, description = ?, weightage = ?, updated_at = NOW()";
    const params = [name, description, weightage];
    query += " WHERE id = ?";
    params.push(id);
    await databaseConnection_1.db.promise().query(query, params);
};
exports.updateCategoryById = updateCategoryById;
// Delete category by ID
const deleteCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM categories WHERE id = ?", [id]);
};
exports.deleteCategoryById = deleteCategoryById;
