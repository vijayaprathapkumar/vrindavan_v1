import { db } from "../../config/databaseConnection"; // Ensure this file is set up correctly
import { ResultSetHeader, RowDataPacket } from "mysql2"; // Ensure RowDataPacket is imported

export const getAllOrders = async (
  userId: number,
  page: number,
  limit: number,
  startDate?: Date,
  endDate?: Date,
  searchTerm?: string | null
): Promise<{ total: number; placeOrders: any[] }> => {
  const offset = (page - 1) * limit;
  let searchCondition = "";
  let dateCondition = "";
  const queryParams: (number | string)[] = [userId];

  if (searchTerm) {
    searchCondition = `AND (p.description LIKE ? OR p.status LIKE ? OR p.method LIKE ?)`;
    const searchValue = `%${searchTerm}%`;
    queryParams.push(searchValue, searchValue, searchValue);
  }

  if (startDate) {
    dateCondition += " AND o.order_date >= ?";
    queryParams.push(startDate.toISOString().slice(0, 10));
  }
  if (endDate) {
    dateCondition += " AND o.order_date <= ?";
    queryParams.push(endDate.toISOString().slice(0, 10));
  }

  // Count total number of orders
  const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total
    FROM orders o
    WHERE o.user_id = ? 
  `;
  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(countQuery, queryParams);

  const query = `
    SELECT 
      o.id AS order_id, o.user_id, o.order_type, o.order_date, o.route_id, o.hub_id,
      o.locality_id, o.order_status_id, o.tax, o.delivery_fee, o.hint, o.active,
      o.delivery_address_id, o.payment_id, o.is_wallet_deduct, o.delivery_status,
      o.created_at, o.updated_at,
      fo.id AS food_order_id, fo.price, fo.quantity,
      f.id AS food_id, f.name, f.discount_price, f.description, f.package_items_count,
      f.weight, f.unit, f.cgst, f.sgst, f.subscription_type, f.track_inventory,
      f.featured, f.deliverable, f.weightage,
      m.id AS media_id, m.model_type, m.model_id, m.uuid, m.collection_name, 
      m.name AS media_name, m.file_name, m.mime_type, m.disk, m.conversions_disk,
      m.size, m.manipulations, m.custom_properties,
      m.responsive_images, m.order_column,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      orders o
    LEFT JOIN food_orders fo ON o.id = fo.order_id
    LEFT JOIN foods f ON fo.food_id = f.id  
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food' 
    WHERE o.user_id = ? ${dateCondition} ${searchCondition}
    ORDER BY o.created_at DESC
    LIMIT ?, ?
  `;
  queryParams.push(offset, limit);

  const [placeOrderRows] = await db
    .promise()
    .query<RowDataPacket[]>(query, queryParams);

  console.log("placeOrderRows", placeOrderRows);
  // Structure the result
  const orderData = [
    ...new Map(
      (placeOrderRows || []).map(
        ({
          order_id,
          food_order_id,
          price,
          quantity,
          food_id,
          name,
          discount_price,
          description,
          package_items_count,
          weight,
          unit,
          cgst,
          sgst,
          subscription_type,
          track_inventory,
          featured,
          deliverable,
          weightage,
          media_id,
          model_type,
          model_id,
          uuid,
          collection_name,
          media_name,
          file_name,
          mime_type,
          disk,
          conversions_disk,
          size,
          manipulations,
          custom_properties,
          responsive_images,
          order_column,
          original_url,
          ...rest
        }) => [
          order_id,
          {
            ...rest,
            order_id,
            food_orders: [
              {
                food_order_id,
                food_id,
                price,
                quantity,
                name,
                discount_price,
                description,
                package_items_count,
                weight,
                unit,
                cgst,
                sgst,
                subscription_type,
                track_inventory,
                featured,
                deliverable,
                weightage,
                media: {
                  media_id,
                  model_type,
                  model_id,
                  uuid,
                  collection_name,
                  media_name,
                  file_name,
                  mime_type,
                  disk,
                  conversions_disk,
                  size,
                  manipulations,
                  custom_properties,
                  responsive_images,
                  order_column,
                  original_url,
                },
              },
            ],
            totalPrice: price * quantity,
            totalQuantity: quantity,
          },
        ]
      )
    ).values(),
  ];

  return { total, placeOrders: orderData };
};

export const getPlaceOrderById = async (orderId: number): Promise<any> => {
  const query = `
    SELECT 
      o.id AS order_id, o.user_id, o.order_type, o.order_date, o.route_id, o.hub_id,
      o.locality_id, o.order_status_id, o.tax, o.delivery_fee, o.hint, o.active,
      o.delivery_address_id, o.payment_id, o.is_wallet_deduct, o.delivery_status,
      o.created_at, o.updated_at,
      fo.id AS food_order_id, fo.price, fo.quantity,
      f.id AS food_id, f.name, f.discount_price, f.description, f.package_items_count,
      f.weight, f.unit, f.cgst, f.sgst, f.subscription_type, f.track_inventory,
      f.featured, f.deliverable, f.weightage,
      m.id AS media_id, m.model_type, m.model_id, m.uuid, m.collection_name, 
      m.name AS media_name, m.file_name, m.mime_type, m.disk, m.conversions_disk,
      m.size, m.manipulations, m.custom_properties,
      m.responsive_images, m.order_column,
      CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url
    FROM 
      orders o
    LEFT JOIN 
      food_orders fo ON o.id = fo.order_id
    LEFT JOIN 
      foods f ON fo.food_id = f.id  
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food' 

    WHERE 
      o.id = ?
  `;

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, [orderId]);

  if (rows.length === 0) {
    return null; // No order found
  }
  // Structure the result
  const orderData = [
    ...new Map(
      (rows || []).map(
        ({
          order_id,
          food_order_id,
          price,
          quantity,
          food_id,
          name,
          discount_price,
          description,
          package_items_count,
          weight,
          unit,
          cgst,
          sgst,
          subscription_type,
          track_inventory,
          featured,
          deliverable,
          weightage,
          media_id,
          model_type,
          model_id,
          uuid,
          collection_name,
          media_name,
          file_name,
          mime_type,
          disk,
          conversions_disk,
          size,
          manipulations,
          custom_properties,
          responsive_images,
          order_column,
          original_url,
          ...rest
        }) => [
          order_id,
          {
            ...rest,
            order_id,
            food_orders: [
              {
                food_order_id,
                food_id,
                price,
                quantity,
                name,
                discount_price,
                description,
                package_items_count,
                weight,
                unit,
                cgst,
                sgst,
                subscription_type,
                track_inventory,
                featured,
                deliverable,
                weightage,
                media: {
                  media_id,
                  model_type,
                  model_id,
                  uuid,
                  collection_name,
                  media_name,
                  file_name,
                  mime_type,
                  disk,
                  conversions_disk,
                  size,
                  manipulations,
                  custom_properties,
                  responsive_images,
                  order_column,
                  original_url,
                },
              },
            ],
            totalPrice: price * quantity,
            totalQuantity: quantity,
          },
        ]
      )
    ).values(),
  ];
  return orderData;
};

export const deletePlaceOrderById = async (id: number) => {
  if (typeof id !== "number" || id <= 0) {
    throw new Error("Invalid ID. It must be a positive number.");
  }

  const sql = `
    DELETE FROM payments 
    WHERE id = ?;
  `;

  try {
    const [result]: [ResultSetHeader, any] = await db
      .promise()
      .query(sql, [id]);

    if (result.affectedRows === 0) {
      throw new Error("Place order not found.");
    }

    console.log(`Successfully deleted place order with ID: ${id}`);
  } catch (error) {
    console.error("SQL Error:", error);
    throw new Error("Failed to delete place order.");
  }
};
