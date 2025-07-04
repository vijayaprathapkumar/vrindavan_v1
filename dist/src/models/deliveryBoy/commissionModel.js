"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCommission = exports.getDetailedCommissionById = exports.getAllDetailedCommissions = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
// Fetch all detailed commissions with search and pagination
const getAllDetailedCommissions = async (searchTerm = "", limit = 10, offset = 0, categoryId = "", sortField = "food_name", sortOrder = "asc") => {
    const searchPattern = `%${searchTerm}%`;
    const categoryFilter = categoryId && categoryId !== "All" ? " AND p.category_id = ?" : "";
    const validSortFields = {
        food_name: "p.name",
        unit: "p.unit",
        mrp: "p.price",
        value: "sc.commission",
    };
    const sortColumn = validSortFields[sortField] || "p.name"; // Ensure a valid sort column
    const validSortOrder = sortOrder === "desc" ? "DESC" : "ASC";
    const queryData = `
    SELECT 
        sc.id AS commission_id,
        sc.category_id AS commission_category_id,
        sc.product_id AS commission_product_id,
        sc.commission AS commission_value,
        sc.created_at AS commission_created_at,
        sc.updated_at AS commission_updated_at,
        c.id AS category_id,
        c.name AS category_name,
        c.description AS category_description,
        c.weightage AS category_weightage,
        c.created_at AS category_created_at,
        c.updated_at AS category_updated_at,
        p.id AS food_id,
        p.name AS food_name,
        p.price AS food_price,
        p.discount_price AS food_discount_price,
        p.description AS food_description,
        p.perma_link AS food_perma_link,
        p.ingredients AS food_ingredients,
        p.package_items_count AS food_package_items_count,
        p.weight AS food_weight,
        p.unit AS food_unit,
        p.sku_code AS food_sku_code,
        p.barcode AS food_barcode,
        p.cgst AS food_cgst,
        p.sgst AS food_sgst,
        p.subscription_type AS food_subscription_type,
        p.track_inventory AS food_track_inventory,
        p.featured AS food_featured,
        p.deliverable AS food_deliverable,
        p.restaurant_id AS food_restaurant_id,
        p.category_id AS food_category_id,
        p.subcategory_id AS food_subcategory_id,
        p.product_type_id AS food_product_type_id,
        p.hub_id AS food_hub_id,
        p.locality_id AS food_locality_id,
        p.product_brand_id AS food_product_brand_id,
        p.weightage AS food_weightage,
        p.status AS food_status,
        p.created_at AS food_created_at,
        p.updated_at AS food_updated_at,
        p.food_locality AS food_food_locality
    FROM 
        foods p
    LEFT JOIN 
        standard_commissions sc ON p.id = sc.product_id
    LEFT JOIN 
        categories c ON   p.category_id  = c.id
   WHERE 
       (p.name LIKE ? OR p.unit LIKE ? OR p.price LIKE ? OR sc.commission LIKE ?)${categoryFilter}
  ORDER BY ${sortColumn} ${validSortOrder}  
    LIMIT ? OFFSET ?;
`;
    const queryCount = `
  SELECT COUNT(*) AS total_count
  FROM foods p
  LEFT JOIN standard_commissions sc ON p.id = sc.product_id
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE 
    (p.name LIKE ? OR p.unit LIKE ? OR p.price LIKE ? OR sc.commission LIKE ?)${categoryFilter};
`;
    const params = [
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        ...(categoryId && categoryId !== "All" ? [parseInt(categoryId)] : []),
        limit,
        offset,
    ];
    const countParams = [
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        ...(categoryId && categoryId !== "All" ? [parseInt(categoryId)] : []),
    ];
    const [rows] = await databaseConnection_1.db.promise().query(queryData, params);
    const [[{ total_count }]] = await databaseConnection_1.db
        .promise()
        .query(queryCount, countParams);
    // Map the rows to a structured format
    const data = rows.map((row) => ({
        id: row.commission_id,
        categoryId: row.commission_category_id,
        productId: row.commission_product_id,
        value: row.commission_value,
        createdAt: row.commission_created_at,
        updatedAt: row.commission_updated_at,
        category: {
            categoryId: row.category_id,
            name: row.category_name,
            description: row.category_description,
            weightage: row.category_weightage,
            createdAt: row.category_created_at,
            updatedAt: row.category_updated_at,
        },
        food: {
            foodId: row.food_id,
            name: row.food_name,
            price: row.food_price,
            discountPrice: row.food_discount_price,
            description: row.food_description,
            permaLink: row.food_perma_link,
            ingredients: row.food_ingredients,
            packageItemsCount: row.food_package_items_count,
            weight: row.food_weight,
            unit: row.food_unit,
            skuCode: row.food_sku_code,
            barcode: row.food_barcode,
            cgst: row.food_cgst,
            sgst: row.food_sgst,
            subscriptionType: row.food_subscription_type,
            trackInventory: row.food_track_inventory,
            featured: row.food_featured,
            deliverable: row.food_deliverable,
            restaurantId: row.food_restaurant_id,
            categoryId: row.food_category_id,
            subcategoryId: row.food_subcategory_id,
            productTypeId: row.food_product_type_id,
            hubId: row.food_hub_id,
            localityId: row.food_locality_id,
            productBrandId: row.food_product_brand_id,
            weightage: row.food_weightage,
            status: row.food_status,
            createdAt: row.food_created_at,
            updatedAt: row.food_updated_at,
            foodLocality: row.food_food_locality,
            image: row.food_image,
        },
    }));
    return { data, totalCount: total_count };
};
exports.getAllDetailedCommissions = getAllDetailedCommissions;
// Fetch detailed commission by ID
const getDetailedCommissionById = async (id) => {
    const [rows] = await databaseConnection_1.db.promise().query(`
    SELECT 
        sc.id AS commission_id,
        sc.category_id AS commission_category_id,
        sc.product_id AS commission_product_id,
        sc.commission AS commission_value,
        sc.created_at AS commission_created_at,
        sc.updated_at AS commission_updated_at,
        c.id AS category_id,
        c.name AS category_name,
        c.description AS category_description,
        c.weightage AS category_weightage,
        c.created_at AS category_created_at,
        c.updated_at AS category_updated_at,
        p.id AS food_id,
        p.name AS food_name,
        p.price AS food_price,
        p.discount_price AS food_discount_price,
        p.description AS food_description,
        p.perma_link AS food_perma_link,
        p.ingredients AS food_ingredients,
        p.package_items_count AS food_package_items_count,
        p.weight AS food_weight,
        p.unit AS food_unit,
        p.sku_code AS food_sku_code,
        p.barcode AS food_barcode,
        p.cgst AS food_cgst,
        p.sgst AS food_sgst,
        p.subscription_type AS food_subscription_type,
        p.track_inventory AS food_track_inventory,
        p.featured AS food_featured,
        p.deliverable AS food_deliverable,
        p.restaurant_id AS food_restaurant_id,
        p.category_id AS food_category_id,
        p.subcategory_id AS food_subcategory_id,
        p.product_type_id AS food_product_type_id,
        p.hub_id AS food_hub_id,
        p.locality_id AS food_locality_id,
        p.product_brand_id AS food_product_brand_id,
        p.weightage AS food_weightage,
        p.status AS food_status,
        p.created_at AS food_created_at,
        p.updated_at AS food_updated_at,
        p.food_locality AS food_food_locality,
        p.image AS food_image
    FROM 
        standard_commissions sc
    LEFT JOIN 
        categories c ON sc.category_id = c.id
    LEFT JOIN 
        foods p ON sc.product_id = p.id
    WHERE 
        sc.id = ?;
  `, [id]);
    // Map the rows to a structured format
    if (rows.length === 0)
        return null; // Handle case where no commission is found
    const row = rows[0];
    return {
        commission: {
            id: row.commission_id,
            categoryId: row.commission_category_id,
            productId: row.commission_product_id,
            value: row.commission_value,
            createdAt: row.commission_created_at,
            updatedAt: row.commission_updated_at,
        },
        category: {
            id: row.category_id,
            name: row.category_name,
            description: row.category_description,
            weightage: row.category_weightage,
            createdAt: row.category_created_at,
            updatedAt: row.category_updated_at,
        },
        food: {
            id: row.food_id,
            name: row.food_name,
            price: row.food_price,
            discountPrice: row.food_discount_price,
            description: row.food_description,
            permaLink: row.food_perma_link,
            ingredients: row.food_ingredients,
            packageItemsCount: row.food_package_items_count,
            weight: row.food_weight,
            unit: row.food_unit,
            skuCode: row.food_sku_code,
            barcode: row.food_barcode,
            cgst: row.food_cgst,
            sgst: row.food_sgst,
            subscriptionType: row.food_subscription_type,
            trackInventory: row.food_track_inventory,
            featured: row.food_featured,
            deliverable: row.food_deliverable,
            restaurantId: row.food_restaurant_id,
            categoryId: row.food_category_id,
            subcategoryId: row.food_subcategory_id,
            productTypeId: row.food_product_type_id,
            hubId: row.food_hub_id,
            localityId: row.food_locality_id,
            productBrandId: row.food_product_brand_id,
            weightage: row.food_weightage,
            status: row.food_status,
            createdAt: row.food_created_at,
            updatedAt: row.food_updated_at,
            foodLocality: row.food_food_locality,
            image: row.food_image,
        },
    };
};
exports.getDetailedCommissionById = getDetailedCommissionById;
const updateCommission = async (commissionId, commissionValue) => {
    const queryUpdate = `
    UPDATE standard_commissions 
    SET commission = ?
    WHERE product_id = ?;
  `;
    const [result] = await databaseConnection_1.db
        .promise()
        .query(queryUpdate, [commissionValue, commissionId]);
    if (result.affectedRows > 0) {
        return { id: commissionId, commission: commissionValue };
    }
    // If no rows were updated, insert the new commission record
    const queryInsert = `
    INSERT INTO standard_commissions (product_id, commission) 
    VALUES (?, ?);
  `;
    const [insertResult] = await databaseConnection_1.db
        .promise()
        .query(queryInsert, [commissionId, commissionValue]);
    if (insertResult.affectedRows > 0) {
        return { id: commissionId, commission: commissionValue };
    }
    return null;
};
exports.updateCommission = updateCommission;
