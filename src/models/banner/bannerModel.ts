import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket } from "mysql2";

// Banner interface
export interface Banner {
  id: number;
  banner_name: string;
  banner_type: number;
  banner_location: number;
  banner_link?: string;
  banner_content?: string;
  food_id?: string;
  banner_weightage?: number;
  date_from?: Date;
  date_to?: Date;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

interface BannerWithMediaAndFood {
  banner: Banner;
  media: any | null;
  food: any | null;
}
// Fetch all banners
export const getAllBanners = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ banners: Banner[]; total: number }> => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      b.id AS banner_id,
      b.banner_name,
      b.banner_type,
      b.banner_location,
      b.banner_link,
      b.banner_content,
      b.food_id,
      b.banner_weightage,
      b.date_from,
      b.date_to,
      b.status,
      b.created_at,
      b.updated_at,
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
       f.id AS food_id,
      f.name AS food_name,
      f.price AS food_price,
      f.discount_price AS food_discount_price,
      f.description AS food_description,
      f.perma_link AS food_perma_link,
      f.ingredients AS food_ingredients,
      f.package_items_count AS food_package_items_count,
      f.weight AS food_weight,
      f.unit AS food_unit,
      f.sku_code AS food_sku_code,
      f.barcode AS food_barcode,
      f.cgst AS food_cgst,
      f.sgst AS food_sgst,
      f.subscription_type AS food_subscription_type,
      f.track_inventory AS food_track_inventory,
      f.featured AS food_featured,
      f.deliverable AS food_deliverable,
      f.restaurant_id AS food_restaurant_id,
      f.category_id AS food_category_id,
      f.subcategory_id AS food_subcategory_id,
      f.product_type_id AS food_product_type_id,
      f.hub_id AS food_hub_id,
      f.locality_id AS food_locality_id,
      f.product_brand_id AS food_product_brand_id,
      f.weightage AS food_weightage,
      f.status AS food_status,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM
      banners b
    LEFT JOIN media m ON b.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Banner'
    LEFT JOIN foods f ON b.food_id = f.id
    WHERE
      b.id IS NOT NULL
  `;

  const params: any[] = [];

  if (searchTerm) {
    query += ` AND b.banner_name LIKE ?`;
    params.push(`%${searchTerm}%`);
  }

  query += ` ORDER BY CAST(b.banner_weightage AS UNSIGNED) ASC LIMIT ? OFFSET ?;`;
  params.push(limit, offset);

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, params);

  const totalCountQuery = `
    SELECT COUNT(*) AS total 
    FROM banners b
    ${searchTerm ? "WHERE b.banner_name LIKE ?" : ""};
  `;

  const countParams: any[] = [];
  if (searchTerm) countParams.push(`%${searchTerm}%`);

  const [totalCountRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(totalCountQuery, countParams);

  const totalCount = totalCountRows[0]?.total || 0;

  return {
    banners: rows.map((row) => ({
      id: row.banner_id,
      banner_name: row.banner_name,
      banner_type: row.banner_type,
      banner_location: row.banner_location,
      banner_link: row.banner_link,
      banner_content: row.banner_content,
      food_id: row.food_id,
      banner_weightage: row.banner_weightage,
      date_from: row.date_from,
      date_to: row.date_to,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      media: {
        id: row.media_id,
        model_type: row.model_type,
        model_id: row.model_id,
        uuid: row.uuid,
        collection_name: row.collection_name,
        name: row.media_name,
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
        created_at: row.media_created_at,
        updated_at: row.media_updated_at,
        original_url: row.original_url,
      },
      food: {
        id: row.food_id,
        name: row.food_name,
        price: row.food_price,
        discount_price: row.food_discount_price,
        description: row.food_description,
        perma_link: row.food_perma_link,
        ingredients: row.food_ingredients,
        package_items_count: row.food_package_items_count,
        weight: row.food_weight,
        unit: row.food_unit,
        sku_code: row.food_sku_code,
        barcode: row.food_barcode,
        cgst: row.food_cgst,
        sgst: row.food_sgst,
        subscription_type: row.food_subscription_type,
        track_inventory: row.food_track_inventory,
        featured: row.food_featured,
        deliverable: row.food_deliverable,
        restaurant_id: row.food_restaurant_id,
        category_id: row.food_category_id,
        subcategory_id: row.food_subcategory_id,
        product_type_id: row.food_product_type_id,
        hub_id: row.food_hub_id,
        locality_id: row.food_locality_id,
        product_brand_id: row.food_product_brand_id,
        weightage: row.food_weightage,
        status: row.food_status,
      },
    })),
    total: totalCount,
  };
};

// Create a new banner
export const createBanner = async (bannerData: {
  banner_name: string;
  banner_type: number;
  banner_location: number;
  banner_link?: string;
  banner_content?: string;
  food_id?: string;
  banner_weightage?: number;
  date_from?: string;
  date_to?: string;
  status: number;
}) => {
  const {
    banner_name,
    banner_type,
    banner_location,
    banner_link,
    banner_content,
    food_id,
    banner_weightage,
    date_from,
    date_to,
    status,
  } = bannerData;

  const sql = `
    INSERT INTO banners 
    (banner_name, banner_type, banner_location, banner_link, banner_content, food_id, banner_weightage, date_from, date_to, status, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
  `;

  const values = [
    banner_name,
    banner_type,
    banner_location,
    banner_link,
    banner_content,
    food_id,
    banner_weightage,
    date_from,
    date_to,
    status,
  ];

  try {
    const [result]: [OkPacket, any] = await db.promise().query(sql, values);
    return result;
  } catch (error) {
    console.error("Error creating banner:", error);
    throw error;
  }
};

// Fetch banner by ID
export const getBannerById = async (
  id: number
): Promise<BannerWithMediaAndFood | null> => {
  const query = `
    SELECT 
      b.id AS banner_id,
      b.banner_name,
      b.banner_type,
      b.banner_location,
      b.banner_link,
      b.banner_content,
      b.food_id,
      b.banner_weightage,
      b.date_from,
      b.date_to,
      b.status,
      b.created_at,
      b.updated_at,
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
      f.id AS food_id,
      f.name AS food_name,
      f.price AS food_price,
      f.discount_price AS food_discount_price,
      f.description AS food_description,
      f.perma_link AS food_perma_link,
      f.ingredients AS food_ingredients,
      f.package_items_count AS food_package_items_count,
      f.weight AS food_weight,
      f.unit AS food_unit,
      f.sku_code AS food_sku_code,
      f.barcode AS food_barcode,
      f.cgst AS food_cgst,
      f.sgst AS food_sgst,
      f.subscription_type AS food_subscription_type,
      f.track_inventory AS food_track_inventory,
      f.featured AS food_featured,
      f.deliverable AS food_deliverable,
      f.restaurant_id AS food_restaurant_id,
      f.category_id AS food_category_id,
      f.subcategory_id AS food_subcategory_id,
      f.product_type_id AS food_product_type_id,
      f.hub_id AS food_hub_id,
      f.locality_id AS food_locality_id,
      f.product_brand_id AS food_product_brand_id,
      f.weightage AS food_weightage,
      f.status AS food_status,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      banners b
    LEFT JOIN media m ON b.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Banner'
    LEFT JOIN foods f ON b.food_id = f.id
    WHERE 
      b.id = ?;
  `;

  const [rows] = await db.promise().query<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];

  return {
    banner: {
      id: row.banner_id,
      banner_name: row.banner_name,
      banner_type: row.banner_type,
      banner_location: row.banner_location,
      banner_link: row.banner_link,
      banner_content: row.banner_content,
      food_id: row.food_id,
      banner_weightage: row.banner_weightage,
      date_from: row.date_from,
      date_to: row.date_to,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    media: row.media_id
      ? {
          id: row.media_id,
          model_type: row.model_type,
          model_id: row.model_id,
          uuid: row.uuid,
          collection_name: row.collection_name,
          name: row.media_name,
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
          created_at: row.media_created_at,
          updated_at: row.media_updated_at,
          original_url: row.original_url,
        }
      : null,
      food: row.food_id
      ? {
          id: row.food_id,
          name: row.food_name,
          price: row.food_price,
          discount_price: row.food_discount_price,
          description: row.food_description,
          perma_link: row.food_perma_link,
          ingredients: row.food_ingredients,
          package_items_count: row.food_package_items_count,
          weight: row.food_weight,
          unit: row.food_unit,
          sku_code: row.food_sku_code,
          barcode: row.food_barcode,
          cgst: row.food_cgst,
          sgst: row.food_sgst,
          subscription_type: row.food_subscription_type,
          track_inventory: row.food_track_inventory,
          featured: row.food_featured,
          deliverable: row.food_deliverable,
          restaurant_id: row.food_restaurant_id,
          category_id: row.food_category_id,
          subcategory_id: row.food_subcategory_id,
          product_type_id: row.food_product_type_id,
          hub_id: row.food_hub_id,
          locality_id: row.food_locality_id,
          product_brand_id: row.food_product_brand_id,
          weightage: row.food_weightage,
          status: row.food_status,
          created_at: row.food_created_at,
          updated_at: row.food_updated_at,
        }
      : null,
  };
};

// Update banner by ID
export const updateBanner = async (
  id: number,
  banner_name?: string,
  banner_type?: number,
  banner_location?: number,
  banner_link?: string,
  banner_content?: string,
  food_id?: string,
  banner_weightage?: number,
  date_from?: string,
  date_to?: string,
  status?: number
): Promise<{ affectedRows: number }> => {
  const updateBannerQuery = `
    UPDATE banners 
    SET 
      banner_name = COALESCE(?, banner_name),
      banner_type = COALESCE(?, banner_type),
      banner_location = COALESCE(?, banner_location),
      banner_link = COALESCE(?, banner_link),
      banner_content = COALESCE(?, banner_content),
      food_id = COALESCE(?, food_id),
      banner_weightage = COALESCE(?, banner_weightage),
      date_from = COALESCE(?, date_from),
      date_to = COALESCE(?, date_to),
      status = COALESCE(?, status),
      updated_at = NOW()
    WHERE 
      id = ?;
  `;

  const values = [
    banner_name,
    banner_type,
    banner_location,
    banner_link,
    banner_content,
    food_id,
    banner_weightage,
    date_from,
    date_to,
    status,
    id,
  ];

  const [result]: [OkPacket, any] = await db
    .promise()
    .query(updateBannerQuery, values);
  return { affectedRows: result.affectedRows };
};

// Delete a banner by ID
export const deleteBannerById = async (
  id: number
): Promise<{ affectedRows: number }> => {
  const query = `
    DELETE FROM banners 
    WHERE id = ?;
  `;

  const [result]: [OkPacket, any] = await db.promise().query(query, [id]);
  return { affectedRows: result.affectedRows };
};
