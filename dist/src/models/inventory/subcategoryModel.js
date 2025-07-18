"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategoryById = exports.updateSubCategoryById = exports.getSubCategoryById = exports.createSubCategory = exports.getSubcategoriesCount = exports.getAllSubCategoriesWithCategory = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getAllSubCategoriesWithCategory = async (limit, offset, searchTerm, categoryId, sortField, sortOrder, active) => {
    let query = `
    SELECT 
      sub_categories.*, 
      categories.id AS category_id,
      categories.name AS category_name, 
      categories.description AS category_description, 
      m.id AS media_id,
      m.model_type,
      m.model_id,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
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
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/subCategory/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
    FROM 
      sub_categories
    LEFT JOIN 
      categories ON sub_categories.category_id = categories.id
    LEFT JOIN 
      media m ON sub_categories.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\SubCategory')
    WHERE 
      (sub_categories.name LIKE ? OR 
      categories.name LIKE ? OR 
      sub_categories.weightage LIKE ?)
  `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    if (categoryId) {
        query += " AND sub_categories.category_id = ?";
        params.push(categoryId);
    }
    if (active !== null) {
        query += " AND sub_categories.active = ?";
        params.push(active);
    }
    const validSortFields = {
        categoryName: "categories.name",
        subcategory_name: "sub_categories.name",
        weightage: "CAST(sub_categories.weightage AS UNSIGNED)",
        subcategory_updated_at: "sub_categories.updated_at",
    };
    if (sortField && validSortFields[sortField]) {
        query += ` ORDER BY ${validSortFields[sortField]} ${sortOrder === "desc" ? "desc" : "asc"}`;
    }
    else {
        query += " ORDER BY CAST(sub_categories.weightage AS UNSIGNED) ASC";
    }
    if (limit && limit > 0) {
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
    }
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    return rows;
};
exports.getAllSubCategoriesWithCategory = getAllSubCategoriesWithCategory;
const getSubcategoriesCount = async (searchTerm, categoryId, active) => {
    let query = `
    SELECT COUNT(*) AS count 
    FROM sub_categories 
    LEFT JOIN categories ON sub_categories.category_id = categories.id
    WHERE 
      (sub_categories.name LIKE ? OR 
      categories.name LIKE ?)
  `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];
    if (categoryId) {
        query += " AND sub_categories.category_id = ?";
        params.push(categoryId);
    }
    if (active !== null) {
        query += " AND sub_categories.active = ?";
        params.push(active);
    }
    const [rows] = await databaseConnection_1.db.promise().query(query, params);
    return rows[0].count;
};
exports.getSubcategoriesCount = getSubcategoriesCount;
// Create a new subcategory
const createSubCategory = async (category_id, name, description, weightage, active) => {
    const [result] = await databaseConnection_1.db
        .promise()
        .query("INSERT INTO sub_categories (category_id, name, description, weightage, active,created_at,updated_at) VALUES (?, ?, ?, ?, ?,?,?)", [category_id, name, description, weightage, active, new Date, new Date]);
    return result.insertId;
};
exports.createSubCategory = createSubCategory;
// Fetch subcategory by ID
const getSubCategoryById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query(`
        SELECT 
          sub_categories.*, 
          m.id AS media_id,
          m.model_type,
          m.model_id,
          m.uuid,
          m.collection_name,
          m.name AS media_name,
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
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/subCategory/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
        FROM 
          sub_categories
        LEFT JOIN 
          categories ON sub_categories.category_id = categories.id
        LEFT JOIN 
          media m ON sub_categories.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\SubCategory')
        WHERE 
          sub_categories.id = ?  
        ORDER BY 
          sub_categories.created_at DESC;
    `, [id]);
    return rows;
};
exports.getSubCategoryById = getSubCategoryById;
// Update subcategory by ID
const updateSubCategoryById = async (id, category_id, name, description, weightage, active) => {
    await databaseConnection_1.db
        .promise()
        .query("UPDATE sub_categories SET category_id = ?, name = ?, description = ?, weightage = ?, active = ? WHERE id = ?", [category_id, name, description, weightage, active, id]);
};
exports.updateSubCategoryById = updateSubCategoryById;
// Delete subcategory by ID
const deleteSubCategoryById = async (id) => {
    await databaseConnection_1.db
        .promise()
        .query("DELETE FROM sub_categories WHERE id = ?", [id]);
};
exports.deleteSubCategoryById = deleteSubCategoryById;
