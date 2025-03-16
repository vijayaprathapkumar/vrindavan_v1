import { db } from "../../config/databaseConnection";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const addSpecialCommission = async (
  categoryId: number,
  productId: number,
  standardCommission: string,
  specialCommission: string,
  deliveryBoyId: number
): Promise<number> => {
  const query = `
    INSERT INTO special_commissions 
    (category_id, product_id, standard_commission, special_commission, delivery_boy_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW());
  `;

  const [result] = await db
    .promise()
    .query(query, [
      categoryId,
      productId,
      standardCommission,
      specialCommission,
      deliveryBoyId,
    ]);

  return (result as any).insertId;
};

export const getAllDetailedSpecialCommissions = async (
  searchTerm: string = "",
  limit: number = 10,
  offset: number = 0,
  categoryId: string = "",
  deliveryBoyId: string = "",
  sortField: string = "",
  sortOrder: string = "asc"
): Promise<{ data: any[]; totalCount: number }> => {
  const searchPattern = `%${searchTerm}%`;
  const categoryFilter =
    categoryId && categoryId !== "All" && !isNaN(parseInt(categoryId))
      ? " AND c.id = ?"
      : "";

  const validSortFields: Record<string, string> = {
    food_name: "p.name",
    unit: "p.unit",
    mrp: "p.price",
    standardCommission: "scs.commission",
    value: "sc.special_commission",
  };

  const sortColumn = validSortFields[sortField] || "p.name";
  const validSortOrder = sortOrder === "desc" ? "desc" : "asc";

  const queryData = `
      SELECT 
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
          c.id AS category_id,
          c.name AS category_name,
          c.description AS category_description,
          c.weightage AS category_weightage,
          c.created_at AS category_created_at,
          c.updated_at AS category_updated_at,
          scs.commission AS standard_commission,
          scs.created_at AS standard_commission_created_at,
          scs.updated_at AS standard_commission_updated_at,
          sc.id AS special_commission_id,
          sc.category_id AS special_commission_category_id,
          sc.product_id AS special_commission_product_id,
          sc.standard_commission AS special_commission_standard_commission,
          COALESCE(sc.special_commission, 0) AS special_commission_value,
          sc.delivery_boy_id AS special_commission_delivery_boy_id,
          COALESCE(sc.special_commission, 0) AS commission_value,
          db.id AS delivery_boy_id,
          db.name AS delivery_boy_name,
          db.mobile AS delivery_boy_mobile,
          db.active AS delivery_boy_active,
          db.cash_collection AS delivery_boy_cash_collection,
          db.delivery_fee AS delivery_boy_delivery_fee,
          db.total_orders AS delivery_boy_total_orders,
          db.earning AS delivery_boy_earning,
          db.available AS delivery_boy_available,
          db.addressPickup AS delivery_boy_addressPickup,
          db.latitudePickup AS delivery_boy_latitudePickup,
          db.longitudePickup AS delivery_boy_longitudePickup,
          db.created_at AS delivery_boy_created_at,
          db.updated_at AS delivery_boy_updated_at
      FROM 
          foods p
      LEFT JOIN 
          categories c ON p.category_id = c.id
      LEFT JOIN 
          standard_commissions scs ON p.id = scs.product_id
      LEFT JOIN 
          special_commissions sc ON p.id = sc.product_id AND sc.delivery_boy_id = ?
      LEFT JOIN 
          delivery_boys db ON sc.delivery_boy_id = db.id
      WHERE 
          (p.name LIKE ? OR c.name LIKE ?)${categoryFilter}
      ORDER BY ${sortColumn} ${validSortOrder}
      LIMIT ? OFFSET ?;
    `;

  const queryCount = `
      SELECT COUNT(*) AS total_count
      FROM foods p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN standard_commissions scs ON p.id = scs.product_id
      LEFT JOIN special_commissions sc ON p.id = sc.product_id AND sc.delivery_boy_id = ?
      WHERE 
          (p.name LIKE ? OR c.name LIKE ?)${categoryFilter};
    `;

  const params = [
    deliveryBoyId && !isNaN(parseInt(deliveryBoyId))
      ? parseInt(deliveryBoyId)
      : null,
    searchPattern,
    searchPattern,
    ...(categoryId && categoryId !== "All" && !isNaN(parseInt(categoryId))
      ? [parseInt(categoryId)]
      : []),
    limit,
    offset,
  ];

  const countParams = [
    deliveryBoyId && !isNaN(parseInt(deliveryBoyId))
      ? parseInt(deliveryBoyId)
      : null,
    searchPattern,
    searchPattern,
    ...(categoryId && categoryId !== "All" && !isNaN(parseInt(categoryId))
      ? [parseInt(categoryId)]
      : []),
  ];

  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(queryData, params);
    const [[{ total_count }]] = await db
      .promise()
      .query<RowDataPacket[]>(queryCount, countParams);

    const data = rows.map((row) => ({
      id: row.special_commission_id,
      categoryId: row.special_commission_category_id,
      productId: row.special_commission_product_id,
      value: row.special_commission_value,
      deliveryBoyId: row.special_commission_delivery_boy_id,
      createdAt: row.food_created_at,
      updatedAt: row.food_updated_at,

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
      },
      standardCommission: {
        commission: row.standard_commission,
        createdAt: row.standard_commission_created_at,
        updatedAt: row.standard_commission_updated_at,
      },
      deliveryBoy: {
        id: row.delivery_boy_id,
        name: row.delivery_boy_name,
        mobile: row.delivery_boy_mobile,
        active: row.delivery_boy_active,
        cashCollection: row.delivery_boy_cash_collection,
        deliveryFee: row.delivery_boy_delivery_fee,
        totalOrders: row.delivery_boy_total_orders,
        earning: row.delivery_boy_earning,
        available: row.delivery_boy_available,
        addressPickup: row.delivery_boy_addressPickup,
        latitudePickup: row.delivery_boy_latitudePickup,
        longitudePickup: row.delivery_boy_longitudePickup,
        createdAt: row.delivery_boy_created_at,
        updatedAt: row.delivery_boy_updated_at,
      },
    }));

    return { data, totalCount: total_count };
  } catch (error) {
    console.error(
      "Error fetching detailed special commissions:",
      error.message
    );
    throw error;
  }
};

export const getDetailedSpecialCommissionById = async (
  id: number
): Promise<any> => {
  const [rows] = await db.promise().query<RowDataPacket[]>(
    `
    SELECT 
        sc.id AS commission_id,
        sc.category_id AS commission_category_id,
        sc.product_id AS commission_product_id,
        sc.special_commission AS commission_value,
        sc.created_at AS commission_created_at,
        sc.updated_at AS commission_updated_at,
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
        scs.commission AS standard_commission,
        scs.created_at AS standard_commission_created_at,
        scs.updated_at AS standard_commission_updated_at
    FROM 
        special_commissions sc
    LEFT JOIN 
        categories c ON sc.category_id = c.id
    LEFT JOIN 
        foods p ON sc.product_id = p.id
    LEFT JOIN 
        standard_commissions scs ON sc.product_id = scs.product_id
    WHERE 
        sc.id = ?;
  `,
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];

  return {
    id: row.commission_id,
    categoryId: row.category_id,
    productId: row.product_id,
    value: row.commission_value,
    createdAt: row.commission_created_at,
    updatedAt: row.commission_updated_at,
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
    },
  };
};

export const updateSpecialCommission = async (
  id: number | string,
  categoryId: number,
  productId: number,
  standardCommission: string,
  specialCommission: string,
  deliveryBoyId: number
): Promise<any> => {
  const query = `
    UPDATE special_commissions
    SET 
      category_id = ?,
      product_id = ?,
      standard_commission = ?,
      special_commission = ?,
      delivery_boy_id = ?,
      updated_at = NOW()
    WHERE id = ?;
  `;
  try {
    const [result] = await db
      .promise()
      .query(query, [
        categoryId,
        productId,
        standardCommission,
        specialCommission,
        deliveryBoyId,
        id,
      ]);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};
