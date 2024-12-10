import { db } from "../../config/databaseConnection";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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

export const getAllOrdersWithOutUserId = async (
  page: number,
  limit: number,
  startDate?: Date,
  endDate?: Date,
  searchTerm?: string | null,
  routeId?: number | null,
  hubId?: number | null,
  localityId?: number | null,
  productId?: string | number | null,
  approveStatus?: string,
  orderType?: string | number | null,
  deliveryBoyId?: string | number | null
): Promise<{ total: number; placeOrders: any[] }> => {
  const offset = (page - 1) * limit;

  const queryParams: (number | string)[] = [];
  let conditions = "";

  if (searchTerm) {
    conditions += ` AND (f.description LIKE ? OR f.name LIKE ?)`;
    const searchValue = `%${searchTerm}%`;
    queryParams.push(searchValue, searchValue);
  }

  // Date range conditions
  if (startDate) {
    conditions += " AND o.order_date >= ?";
    queryParams.push(startDate.toISOString().slice(0, 10));
  }
  if (endDate) {
    conditions += " AND o.order_date <= ?";
    queryParams.push(endDate.toISOString().slice(0, 10));
  }

  if (routeId) {
    conditions += " AND o.route_id = ?";
    queryParams.push(routeId);
  }
  if (hubId) {
    conditions += " AND o.hub_id = ?";
    queryParams.push(hubId);
  }
  if (localityId) {
    conditions += " AND o.locality_id = ?";
    queryParams.push(localityId);
  }

  if (deliveryBoyId !== null && deliveryBoyId !== "All") {
    const parsedDeliveryBoyId = Number(deliveryBoyId);
    if (!isNaN(parsedDeliveryBoyId)) {
      conditions += " AND db.id = ?";
      queryParams.push(parsedDeliveryBoyId);
    }
  }
  
  // ApproveStatus condition (handle "All", "1", "0")
  if (approveStatus !== "All") {
    conditions += " AND da.is_approve = ?";
    queryParams.push(parseInt(approveStatus, 10));
  }


  
  if (productId !== null && productId !== "All") {
    const parsedProductId = Number(productId);
    if (!isNaN(parsedProductId)) {
      conditions += " AND f.id = ?";
      queryParams.push(parsedProductId);
    }
  }
  

  // OrderType condition
  if (orderType && orderType !== "All") {
    conditions += " AND o.order_type = ?";
    queryParams.push(orderType);
  }

  const countQuery = `
    SELECT COUNT(DISTINCT o.id) AS total
    FROM orders o
    JOIN delivery_addresses da ON o.delivery_address_id = da.id
    LEFT JOIN locality_delivery_boys ldb ON o.locality_id = ldb.locality_id
    LEFT JOIN delivery_boys db ON ldb.delivery_boy_id = db.id
    LEFT JOIN food_orders fo ON o.id = fo.order_id
    LEFT JOIN foods f ON fo.food_id = f.id
    WHERE 1=1 ${conditions};

`;

  const [[{ total }]] = await db
    .promise()
    .query<RowDataPacket[]>(countQuery, queryParams);

  const query = `
  SELECT 
    o.id AS order_id, 
    o.user_id, 
    o.order_type, 
    o.order_date, 
    o.route_id, 
    o.hub_id,
    o.locality_id, 
    o.delivery_boy_id AS order_delivery_boy_id,
    o.order_status_id, 
    o.tax, 
    o.delivery_fee, 
    o.hint, 
    o.active,
    o.delivery_address_id, 
    o.payment_id, 
    o.is_wallet_deduct, 
    o.delivery_status,
    o.created_at, 
    o.updated_at,
    
    fo.id AS food_order_id, 
    fo.price, 
    fo.quantity,
    
    f.id AS food_id, 
    f.name, 
    f.discount_price, 
    f.description, 
    f.package_items_count,
    f.weight, 
    f.unit, 
    f.cgst, 
    f.sgst, 
    f.subscription_type, 
    f.track_inventory,
    f.featured, 
    f.deliverable, 
    f.weightage,
    f.product_type_id,
    f.category_id,
    f.subcategory_id,
    f.product_brand_id,
    
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
    m.responsive_images, 
    m.order_column,
    CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url,
    
    tr.id AS truck_route_id, 
    tr.name AS truck_route_name, 
    tr.active AS truck_route_active,
    tr.created_at AS truck_route_created_at, 
    tr.updated_at AS truck_route_updated_at,
    
    h.id AS hub_id, 
    h.name AS hub_name, 
    h.other_details AS hub_details,
    h.active AS hub_active, 
    h.created_at AS hub_created_at, 
    h.updated_at AS hub_updated_at,
    
    l.id AS locality_id, 
    l.route_id AS locality_route_id, 
    l.hub_id AS locality_hub_id,
    l.name AS locality_name, 
    l.address AS locality_address, 
    l.google_address, 
    l.latitude, 
    l.longitude, 
    l.city, 
    l.active AS locality_active, 
    l.created_at AS locality_created_at, 
    l.updated_at AS locality_updated_at,

    da.description AS delivery_addresses_description,
    da.address AS delivery_addresses_address,
    da.latitude AS delivery_addresses_latitude,
    da.longitude AS delivery_addresses_longitude,
    da.house_no AS delivery_addresses_house_no,
    da.complete_address AS delivery_addresses_complete_address,
    da.is_approve AS delivery_addresses_is_approve,
    da.is_default AS delivery_addresses_is_default,
    da.user_id AS delivery_addresses_user_id,
    da.locality_id AS delivery_addresses_locality_id,
    da.created_at AS delivery_addresses_created_at, 
    da.updated_at AS delivery_addresses_updated_at,
    
    p.id AS payment_id,
    p.price AS payment_price,
    p.description AS payment_description,
    p.user_id AS payment_user_id,
    p.status AS payment_status,
    p.method AS payment_method,
    p.created_at AS payment_created_at,
    p.updated_at AS payment_updated_at,

ldb.id AS locality_delivery_boy_id,
    ldb.locality_id AS locality_delivery_boy_locality_id,
    ldb.delivery_boy_id AS locality_delivery_boy_delivery_boy_id,
    ldb.created_at AS locality_delivery_boy_created_at,
    ldb.updated_at AS locality_delivery_boy_updated_at,

     db.id AS delivery_boy_id,
    db.user_id AS delivery_boy_user_id,
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
    db.updated_at AS delivery_boy_updated_at,

    pt.id AS product_type_ids,
    pt.name AS product_type_name,
    pt.weightage AS product_type_weightage,
    pt.active AS product_type_active,
    pt.created_at AS product_type_created_at,
    pt.updated_at AS product_type_updated_at,

    u.name AS user_name, 
    u.email AS user_email, 
    u.phone AS user_phone, 
    u.delivery_priority AS user_delivery_priority, 
    u.status, 
    u.is_deactivated, 
    u.is_deactivated_at, 
    u.created_at, 
    u.updated_at,

    os.id AS order_status_id,
    os.status AS order_status,
    os.created_at AS order_status_created_at,
    os.updated_at AS order_status_updated_at

  FROM 
    orders o
 LEFT JOIN locality_delivery_boys ldb ON o.locality_id = ldb.locality_id
  LEFT JOIN food_orders fo ON o.id = fo.order_id
  LEFT JOIN foods f ON fo.food_id = f.id  
  LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food' 
  LEFT JOIN truck_routes tr ON o.route_id = tr.id
  LEFT JOIN hubs h ON o.hub_id = h.id
  LEFT JOIN localities l ON o.locality_id = l.id
  LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
  LEFT JOIN payments p ON o.payment_id = p.id
  LEFT JOIN delivery_boys db ON ldb.delivery_boy_id = db.id
  LEFT JOIN product_types pt ON f.product_type_id = pt.id
  LEFT JOIN order_statuses os ON o.order_status_id =os.id
  LEFT JOIN users u ON o.user_id = u.id
  WHERE 
    1 = 1 
    ${conditions}
  ORDER BY 
    o.created_at DESC
  LIMIT ?, ?;
  `;
  queryParams.push(offset, limit);

  const [placeOrderRows] = await db
    .promise()
    .query<RowDataPacket[]>(query, queryParams);

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
          product_type_id,
          category_id,
          subcategory_id,
          product_brand_id,
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
          truck_route_id,
          truck_route_name,
          truck_route_active,
          truck_route_created_at,
          truck_route_updated_at,
          hub_id,
          hub_name,
          hub_details,
          hub_active,
          hub_created_at,
          hub_updated_at,
          locality_id,
          locality_route_id,
          locality_hub_id,
          locality_name,
          locality_address,
          google_address,
          latitude,
          longitude,
          city,
          locality_active,
          locality_created_at,
          locality_updated_at,
          delivery_addresses_description,
          delivery_addresses_address,
          delivery_addresses_latitude,
          delivery_addresses_longitude,
          delivery_addresses_house_no,
          delivery_addresses_complete_address,
          delivery_addresses_is_approve,
          delivery_addresses_is_default,
          delivery_addresses_user_id,
          delivery_addresses_locality_id,
          delivery_addresses_created_at,
          delivery_addresses_updated_at,
          payment_id,
          payment_price,
          payment_description,
          payment_user_id,
          payment_status,
          payment_method,
          payment_created_at,
          payment_updated_at,
          delivery_boy_id,
          delivery_boy_userId,
          delivery_boy_name,
          delivery_boy_mobile,
          delivery_boy_active,
          delivery_boy_cash_collection,
          delivery_boy_delivery_fee,
          delivery_boy_total_orders,
          delivery_boy_earning,
          delivery_boy_available,
          delivery_boy_addressPickup,
          delivery_boy_latitudePickup,
          delivery_boy_longitudePickup,
          delivery_boy_created_at,
          delivery_boy_updated_at,
          product_type_ids,
          product_type_name,
          product_type_weightage,
          product_type_active,
          product_type_created_at,
          product_type_updated_at,
          user_name,
          user_email,
          user_phone,
          user_delivery_priority,
          user_status,
          user_is_deactivated,
          user_is_deactivated_at,
          user_created_at,
          user_updated_at,
          order_status_id,
          order_status,
          order_status_created_at,
          order_status_updated_at,
          ...rest
        }) => [
          order_id,
          {
            ...rest,
            order_id,
            truck_routes: {
              truck_route_id,
              truck_route_name,
              truck_route_active,
              truck_route_created_at,
              truck_route_updated_at,
            },
            hubs: {
              hub_id,
              hub_name,
              hub_details,
              hub_active,
              hub_created_at,
              hub_updated_at,
            },
            localities: {
              locality_id,
              locality_route_id,
              locality_hub_id,
              locality_name,
              locality_address,
              google_address,
              latitude,
              longitude,
              city,
              locality_active,
              locality_created_at,
              locality_updated_at,
            },
            delivery_addresses: {
              delivery_addresses_description,
              delivery_addresses_address,
              delivery_addresses_latitude,
              delivery_addresses_longitude,
              delivery_addresses_house_no,
              delivery_addresses_complete_address,
              delivery_addresses_is_approve,
              delivery_addresses_is_default,
              delivery_addresses_user_id,
              delivery_addresses_locality_id,
              delivery_addresses_created_at,
              delivery_addresses_updated_at,
            },
            payment: {
              payment_id,
              payment_price,
              payment_description,
              payment_user_id,
              payment_status,
              payment_method,
              payment_created_at,
              payment_updated_at,
            },
            delivery_boy: {
              delivery_boy_id,
              delivery_boy_userId,
              delivery_boy_name,
              delivery_boy_mobile,
              delivery_boy_active,
              delivery_boy_cash_collection,
              delivery_boy_delivery_fee,
              delivery_boy_total_orders,
              delivery_boy_earning,
              delivery_boy_available,
              delivery_boy_addressPickup,
              delivery_boy_latitudePickup,
              delivery_boy_longitudePickup,
              delivery_boy_created_at,
              delivery_boy_updated_at,
            },
            product_type: {
              product_type_ids,
              product_type_name,
              product_type_weightage,
              product_type_active,
              product_type_created_at,
              product_type_updated_at,
            },
            users: {
              user_name,
              user_email,
              user_phone,
              user_delivery_priority,
              user_status,
              user_is_deactivated,
              user_is_deactivated_at,
              user_created_at,
              user_updated_at,
            },
            order_status: {
              order_status_id,
              order_status,
              order_status_created_at,
              order_status_updated_at,
            },
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
                product_type_id,
                category_id,
                subcategory_id,
                product_brand_id,
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
    o.id AS order_id, 
    o.user_id, 
    o.order_type, 
    o.order_date, 
    o.route_id, 
    o.hub_id,
    o.locality_id, 
    o.delivery_boy_id AS order_delivery_boy_id,
    o.order_status_id, 
    o.tax, 
    o.delivery_fee, 
    o.hint, 
    o.active,
    o.delivery_address_id, 
    o.payment_id, 
    o.is_wallet_deduct, 
    o.delivery_status,
    o.created_at, 
    o.updated_at,
    
    fo.id AS food_order_id, 
    fo.price, 
    fo.quantity,
    
    f.id AS food_id, 
    f.name, 
    f.discount_price, 
    f.description, 
    f.package_items_count,
    f.weight, 
    f.unit, 
    f.cgst, 
    f.sgst, 
    f.subscription_type, 
    f.track_inventory,
    f.featured, 
    f.deliverable, 
    f.weightage,
    f.product_type_id,
    f.category_id,
    f.subcategory_id,
    f.product_brand_id,
    
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
    m.responsive_images, 
    m.order_column,
    CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name) AS original_url,
    
    tr.id AS truck_route_id, 
    tr.name AS truck_route_name, 
    tr.active AS truck_route_active,
    tr.created_at AS truck_route_created_at, 
    tr.updated_at AS truck_route_updated_at,
    
    h.id AS hub_id, 
    h.name AS hub_name, 
    h.other_details AS hub_details,
    h.active AS hub_active, 
    h.created_at AS hub_created_at, 
    h.updated_at AS hub_updated_at,
    
    l.id AS locality_id, 
    l.route_id AS locality_route_id, 
    l.hub_id AS locality_hub_id,
    l.name AS locality_name, 
    l.address AS locality_address, 
    l.google_address, 
    l.latitude, 
    l.longitude, 
    l.city, 
    l.active AS locality_active, 
    l.created_at AS locality_created_at, 
    l.updated_at AS locality_updated_at,

    da.description AS delivery_addresses_description,
    da.address AS delivery_addresses_address,
    da.latitude AS delivery_addresses_latitude,
    da.longitude AS delivery_addresses_longitude,
    da.house_no AS delivery_addresses_house_no,
    da.complete_address AS delivery_addresses_complete_address,
    da.is_approve AS delivery_addresses_is_approve,
    da.is_default AS delivery_addresses_is_default,
    da.user_id AS delivery_addresses_user_id,
    da.locality_id AS delivery_addresses_locality_id,
    da.created_at AS delivery_addresses_created_at, 
    da.updated_at AS delivery_addresses_updated_at,
    
    p.id AS payment_id,
    p.price AS payment_price,
    p.description AS payment_description,
    p.user_id AS payment_user_id,
    p.status AS payment_status,
    p.method AS payment_method,
    p.created_at AS payment_created_at,
    p.updated_at AS payment_updated_at,

    db.id As delivery_boy_id,
    db.user_id As delivery_boy_userId,
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
    db.updated_at AS delivery_boy_updated_at,

    pt.id AS product_type_ids,
    pt.name AS product_type_name,
    pt.weightage AS product_type_weightage,
    pt.active AS product_type_active,
    pt.created_at AS product_type_created_at,
    pt.updated_at AS product_type_updated_at,

    u.name AS user_name, 
    u.email AS user_email, 
    u.phone AS user_phone, 
    u.delivery_priority AS user_delivery_priority, 
    u.status, 
    u.is_deactivated, 
    u.is_deactivated_at, 
    u.created_at, 
    u.updated_at,

    os.id AS order_status_id,
    os.status AS order_status,
    os.created_at AS order_status_created_at,
    os.updated_at AS order_status_updated_at
     FROM 
    orders o
  LEFT JOIN food_orders fo ON o.id = fo.order_id
  LEFT JOIN foods f ON fo.food_id = f.id  
  LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food' 
  LEFT JOIN truck_routes tr ON o.route_id = tr.id
  LEFT JOIN hubs h ON o.hub_id = h.id
  LEFT JOIN localities l ON o.locality_id = l.id
  LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
  LEFT JOIN payments p ON o.payment_id = p.id
  LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.id
  LEFT JOIN product_types pt ON f.product_type_id = pt.id
  LEFT JOIN order_statuses os ON o.order_status_id =os.id
  LEFT JOIN users u ON o.user_id = u.id
    WHERE 
      u.id = ?
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
          product_type_id,
          category_id,
          subcategory_id,
          product_brand_id,
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
          truck_route_id,
          truck_route_name,
          truck_route_active,
          truck_route_created_at,
          truck_route_updated_at,
          hub_id,
          hub_name,
          hub_details,
          hub_active,
          hub_created_at,
          hub_updated_at,
          locality_id,
          locality_route_id,
          locality_hub_id,
          locality_name,
          locality_address,
          google_address,
          latitude,
          longitude,
          city,
          locality_active,
          locality_created_at,
          locality_updated_at,
          delivery_addresses_description,
          delivery_addresses_address,
          delivery_addresses_latitude,
          delivery_addresses_longitude,
          delivery_addresses_house_no,
          delivery_addresses_complete_address,
          delivery_addresses_is_approve,
          delivery_addresses_is_default,
          delivery_addresses_user_id,
          delivery_addresses_locality_id,
          delivery_addresses_created_at,
          delivery_addresses_updated_at,
          payment_id,
          payment_price,
          payment_description,
          payment_user_id,
          payment_status,
          payment_method,
          payment_created_at,
          payment_updated_at,
          delivery_boy_id,
          delivery_boy_userId,
          delivery_boy_name,
          delivery_boy_mobile,
          delivery_boy_active,
          delivery_boy_cash_collection,
          delivery_boy_delivery_fee,
          delivery_boy_total_orders,
          delivery_boy_earning,
          delivery_boy_available,
          delivery_boy_addressPickup,
          delivery_boy_latitudePickup,
          delivery_boy_longitudePickup,
          delivery_boy_created_at,
          delivery_boy_updated_at,
          product_type_ids,
          product_type_name,
          product_type_weightage,
          product_type_active,
          product_type_created_at,
          product_type_updated_at,
          user_name,
          user_email,
          user_phone,
          user_delivery_priority,
          user_status,
          user_is_deactivated,
          user_is_deactivated_at,
          user_created_at,
          user_updated_at,
          order_status_id,
          order_status,
          order_status_created_at,
          order_status_updated_at,
          ...rest
        }) => [
          order_id,
          {
            ...rest,
            order_id,
            truck_routes: {
              truck_route_id,
              truck_route_name,
              truck_route_active,
              truck_route_created_at,
              truck_route_updated_at,
            },
            hubs: {
              hub_id,
              hub_name,
              hub_details,
              hub_active,
              hub_created_at,
              hub_updated_at,
            },
            localities: {
              locality_id,
              locality_route_id,
              locality_hub_id,
              locality_name,
              locality_address,
              google_address,
              latitude,
              longitude,
              city,
              locality_active,
              locality_created_at,
              locality_updated_at,
            },
            delivery_addresses: {
              delivery_addresses_description,
              delivery_addresses_address,
              delivery_addresses_latitude,
              delivery_addresses_longitude,
              delivery_addresses_house_no,
              delivery_addresses_complete_address,
              delivery_addresses_is_approve,
              delivery_addresses_is_default,
              delivery_addresses_user_id,
              delivery_addresses_locality_id,
              delivery_addresses_created_at,
              delivery_addresses_updated_at,
            },
            payment: {
              payment_id,
              payment_price,
              payment_description,
              payment_user_id,
              payment_status,
              payment_method,
              payment_created_at,
              payment_updated_at,
            },
            delivery_boy: {
              delivery_boy_id,
              delivery_boy_userId,
              delivery_boy_name,
              delivery_boy_mobile,
              delivery_boy_active,
              delivery_boy_cash_collection,
              delivery_boy_delivery_fee,
              delivery_boy_total_orders,
              delivery_boy_earning,
              delivery_boy_available,
              delivery_boy_addressPickup,
              delivery_boy_latitudePickup,
              delivery_boy_longitudePickup,
              delivery_boy_created_at,
              delivery_boy_updated_at,
            },
            product_type: {
              product_type_ids,
              product_type_name,
              product_type_weightage,
              product_type_active,
              product_type_created_at,
              product_type_updated_at,
            },
            users: {
              user_name,
              user_email,
              user_phone,
              user_delivery_priority,
              user_status,
              user_is_deactivated,
              user_is_deactivated_at,
              user_created_at,
              user_updated_at,
            },
            order_status: {
              order_status_id,
              order_status,
              order_status_created_at,
              order_status_updated_at,
            },
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
                product_type_id,
                category_id,
                subcategory_id,
                product_brand_id,
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

// Update Order
export const updateOneTimeOrders = async (
  orderId: number,
  quantity?: number,
  orderDate?: string
): Promise<void> => {
  try {
    const updates: string[] = [];
    const params: (number | string)[] = [];

    // Prepare updates based on provided values
    if (quantity !== undefined) {
      updates.push("quantity = ?");
      params.push(quantity);
    }

    if (orderDate !== undefined) {
      updates.push("order_date = ?");
      params.push(orderDate);
    }

    if (updates.length > 0) {
      const sql = `UPDATE food_orders SET ${updates.join(
        ", "
      )} WHERE order_id = ?`;
      params.push(orderId);

      await db.promise().query(sql, params);
    } else {
      console.log("No updates provided.");
    }
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

export const updateSubscriptionOrders = async (
  subscriptionId: number,
  quantity: number,
  orderDate?: string
): Promise<void> => {
  try {
    const [subscriptionItems]: [RowDataPacket[], any] = await db
      .promise()
      .query(
        `SELECT user_id, product_id FROM user_subscriptions WHERE id = ?`,
        [subscriptionId]
      );

    if (subscriptionItems.length === 0) {
      console.log("No subscription items found.");
      return;
    }

    const { user_id, product_id } = subscriptionItems[0];

    // Attempt to update subscription quantity
    const [updateResult]: [ResultSetHeader, any] = await db.promise().query(
      `UPDATE subscription_quantity_changes 
         SET quantity = ?, order_date = ? 
         WHERE user_subscription_id = ?`,
      [quantity, orderDate, subscriptionId]
    );

    // If no rows were updated, insert a new record
    if (updateResult.affectedRows === 0) {
      await db.promise().query(
        `INSERT INTO subscription_quantity_changes (
          user_subscription_id, order_type, user_id, product_id, quantity, order_date
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [subscriptionId, 2, user_id, product_id, quantity, orderDate]
      );
    }
  } catch (error) {
    console.error("Error updating subscription quantities:", error);
  }
};

export const deletePlaceOrderById = async (id: number) => {
  const updateSubscriptionSql = `
    UPDATE subscription_quantity_changes 
    SET 
      cancel_order_date = NOW(), cancel_subscription = 1
    WHERE user_subscription_id = (
      SELECT user_subscription_id FROM orders WHERE id=?
    );
  `;

  const deleteFoodOrderSql = `
    DELETE FROM food_orders 
    WHERE order_id = ?;
  `;

  const sql = `
    DELETE FROM orders 
    WHERE id = ?;
  `;

  await db.promise().query(updateSubscriptionSql, [id]);

  await db.promise().query(deleteFoodOrderSql, [id]);

  const [result]: [ResultSetHeader, any] = await db.promise().query(sql, [id]);

  if (result.affectedRows === 0) {
    throw new Error("Order not found.");
  }
};
