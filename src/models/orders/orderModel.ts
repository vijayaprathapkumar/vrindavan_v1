import moment from "moment";
import { db } from "../../config/databaseConnection";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2";

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
     CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url
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

            food_orders: {
              order_id,
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
  deliveryBoyId?: string | number | null,
  walletFilter?: string | null,
  sortField?: string,
  sortOrder?: string
): Promise<{ total: number; placeOrders: any[] }> => {
  const offset = (page - 1) * limit;

  const queryParams: (number | string)[] = [];
  let conditions = "";

  if (searchTerm) {
    conditions += ` AND (f.name LIKE ?
     OR tr.name LIKE ?  
     OR h.name LIKE ? 
     OR f.unit LIKE ? 
     OR fo.quantity LIKE ?
     OR db.name LIKE ? 
     OR fo.price LIKE ?
     OR f.weightage LIKE ?
     OR pt.weightage LIKE ?
     OR u.name LIKE ?
     OR u.phone LIKE ?
     OR da.house_no LIKE ?
     OR da.complete_address LIKE ?
     OR p.price LIKE ?
     OR l.name LIKE ?
     OR o.id LIKE ?
     )`;
    queryParams.push(
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`
    );
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

  if (orderType && orderType !== "All") {
    conditions += " AND o.order_type = ?";
    queryParams.push(orderType);
  }

  if (walletFilter) {
    if (walletFilter === "1") {
      conditions += " AND o.is_wallet_deduct = 0";
    } else if (walletFilter === "2") {
      conditions += " AND o.is_wallet_deduct = 1";
    }
  }

  const validSortFields = [
    "truck_route_name",
    "hub_name",
    "f.name",
    "fo.quantity",
    "f.unit",
    "db.name",
    "fo.price",
    "f.weightage",
    "pt.weightage",
    "u.name",
    "u.phone",
    "da.house_no",
    "da.complete_address",
    "p.price",
    "l.name",
  ];

  const sortColumn = validSortFields.includes(sortField)
    ? sortField
    : "o.created_at";
  const sortOrderClause = sortOrder === "asc" ? "asc" : "desc";

  const countQuery = `
    SELECT COUNT(DISTINCT o.id) AS total
    FROM orders o
    LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
    LEFT JOIN locality_delivery_boys ldb ON o.locality_id = ldb.locality_id
    LEFT JOIN delivery_boys db ON ldb.delivery_boy_id = db.id
    LEFT JOIN food_orders fo ON o.id = fo.order_id
    LEFT JOIN foods f ON fo.food_id = f.id
    LEFT JOIN truck_routes tr ON o.route_id = tr.id 
    LEFT JOIN hubs h ON o.hub_id = h.id
    LEFT JOIN product_types pt ON f.product_type_id = pt.id
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN payments p ON o.payment_id = p.id
    LEFT JOIN localities l ON o.locality_id = l.id
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
    o.payment_id AS order_payment_id, 
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
     CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url,
    
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
  ORDER BY ${sortColumn} ${sortOrderClause}
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
          order_payment_id,
          ...rest
        }) => [
          order_id,
          {
            ...rest,
            order_id,
            order_payment_id,
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

export const getPlaceOrderById = async (
  orderId: number,
  searchTerm: string | null
): Promise<any> => {
  let query = `
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
      CASE 
        WHEN m.conversions_disk = 'public1' 
        THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
        ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
      END AS original_url,
    
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
      o.user_id = ?
     
  `;

  const queryParams: (number | string)[] = [orderId];

  if (searchTerm) {
    query += ` AND f.name LIKE ?`;
    queryParams.push(`%${searchTerm}%`);
  }

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, queryParams);

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
  quantity?: number
): Promise<void> => {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    const currentOrderSql = `SELECT quantity, food_id FROM food_orders WHERE order_id = ?`;
    const [orderRows]: any = await connection.query(currentOrderSql, [orderId]);

    if (orderRows.length === 0) {
      throw new Error(`Order ID ${orderId} not found.`);
    }

    const { quantity: currentQuantity, food_id } = orderRows[0];

    if (quantity !== undefined && quantity !== currentQuantity) {
      const quantityDifference = quantity - currentQuantity;

      const updateOrderSql = `UPDATE food_orders SET quantity = ? WHERE order_id = ?`;
      await connection.query(updateOrderSql, [quantity, orderId]);

      const updateStockSql = `
        INSERT INTO stock_mutations (
          stockable_type, stockable_id, reference_type, reference_id, 
          amount, description, created_at, updated_at
        ) VALUES ('food', ?, 'order_update', ?, ?, 'Stock adjusted due to order update', NOW(), NOW());
      `;
      await connection.query(updateStockSql, [
        food_id,
        orderId,
        -quantityDifference,
      ]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error updating order:", error);
    throw error;
  } finally {
    connection.release();
  }
};

export const updateSubscriptionOrders = async (
  subscriptionId: number,
  quantity: number,
  orderDate?: string
): Promise<void> => {
  try {
    // Fetch subscription items from the database
    const [subscriptionItems]: [RowDataPacket[], any] = await db
      .promise()
      .query(
        `SELECT user_id, product_id, monday_qty, tuesday_qty, wednesday_qty, 
                thursday_qty, friday_qty, saturday_qty, sunday_qty 
         FROM user_subscriptions 
         WHERE id = ?`,
        [subscriptionId]
      );

    if (subscriptionItems.length === 0) {
      console.log("No subscription items found.");
      return;
    }

    if (orderDate) {
      const date = new Date(orderDate);
      orderDate = date.toISOString().split("T")[0];
    }

    const { user_id, product_id, ...dailyQuantities } = subscriptionItems[0];

    // Update subscription quantity changes
    const [updateResult]: [ResultSetHeader, any] = await db.promise().query(
      `UPDATE subscription_quantity_changes 
       SET quantity = ? 
       WHERE user_subscription_id = ? AND order_date = ?`,
      [quantity, subscriptionId, orderDate]
    );

    // If no rows were affected, insert the new data
    if (updateResult.affectedRows === 0) {
      await db.promise().query(
        `INSERT INTO subscription_quantity_changes (
          user_subscription_id, order_type, user_id, product_id, quantity, order_date
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [subscriptionId, 2, user_id, product_id, quantity, orderDate]
      );
    }

    if (orderDate) {
      const dateObj = new Date(orderDate);
      const dayOfWeek = dateObj
        .toLocaleString("en-us", { weekday: "long" })
        .toLowerCase();

      const dayQuantityField = `${dayOfWeek}_qty`;

      if (dailyQuantities[dayQuantityField]) {
        await db.promise().query(
          `INSERT INTO subscription_quantity_changes (
            user_subscription_id, order_type, user_id, product_id, quantity, order_date
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE quantity = ?`,
          [
            subscriptionId,
            2,
            user_id,
            product_id,
            dailyQuantities[dayQuantityField],
            orderDate,
            dailyQuantities[dayQuantityField], // Update quantity if exists
          ]
        );
      }
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

export const cancelOrder = async (
  subscriptionId: number,
  cancelOrderDate: string,
  reason: string,
  otherReason?: string
): Promise<void> => {
  try {
    const formattedCancelOrderDate = new Date(cancelOrderDate)
      .toISOString()
      .split("T")[0];

    const [userRow]: any[] = await db
      .promise()
      .query(
        `SELECT user_id, start_date, end_date FROM user_subscriptions WHERE id = ?`,
        [subscriptionId]
      );

    if (userRow.length === 0) {
      throw new Error(`No subscription found with ID ${subscriptionId}`);
    }

    const userId = userRow[0].user_id;
    const startDate = userRow[0].start_date;
    const endDate = userRow[0].end_date;

    await db.promise().query(
      `DELETE FROM subscription_quantity_changes 
       WHERE user_subscription_id = ? AND order_date = ?`,
      [subscriptionId, formattedCancelOrderDate]
    );

    const [rows]: any[] = await db.promise().query(
      `SELECT id FROM subscription_quantity_changes 
       WHERE user_subscription_id = ? AND cancel_order_date = ?`,
      [subscriptionId, formattedCancelOrderDate]
    );

    if (rows.length > 0) {
      await db.promise().query(
        `UPDATE subscription_quantity_changes
         SET cancel_order = 1, reason = ?, other_reason = ?, user_id = ?
         WHERE id = ?`,
        [reason, otherReason || null, userId, rows[0].id]
      );
    } else {
      await db.promise().query(
        `INSERT INTO subscription_quantity_changes (
           user_subscription_id, user_id, cancel_order_date, cancel_order, reason, other_reason, start_date, end_date
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subscriptionId,
          userId,
          formattedCancelOrderDate,
          1,
          reason,
          otherReason || null,
          startDate,
          endDate,
        ]
      );
    }
  } catch (error) {
    throw new Error(`Error canceling the order: ${error.message}`);
  }
};

export const getUpcomingOrdersModel = (
  userId: number,
  currentDate: Date
): Promise<any[]> => {
  const formattedDate = currentDate.toISOString().split("T")[0]; 

  const query = `
  SELECT 
    us.id AS user_subscription_id,
    us.user_id,
    us.product_id,
    us.subscription_type,
    us.start_date,
    us.end_date,
    us.quantity,
    us.monday_qty,
    us.tuesday_qty,
    us.wednesday_qty,
    us.thursday_qty,
    us.friday_qty,
    us.saturday_qty,
    us.sunday_qty,
    us.cancel_subscription,
    us.is_pause_subscription,
    us.pause_until_i_come_back,
    us.pause_specific_period_startDate,
    us.pause_specific_period_endDate,
    sqc.order_type,
    sqc.order_date,
    COALESCE(
      sqc.quantity, 
      CASE 
        WHEN us.subscription_type = 'customize' THEN
          CASE 
            WHEN DAYNAME(?) = 'Monday' THEN us.monday_qty
            WHEN DAYNAME(?) = 'Tuesday' THEN us.tuesday_qty
            WHEN DAYNAME(?) = 'Wednesday' THEN us.wednesday_qty
            WHEN DAYNAME(?) = 'Thursday' THEN us.thursday_qty
            WHEN DAYNAME(?) = 'Friday' THEN us.friday_qty
            WHEN DAYNAME(?) = 'Saturday' THEN us.saturday_qty
            WHEN DAYNAME(?) = 'Sunday' THEN us.sunday_qty
            ELSE NULL  
          END
        ELSE us.quantity
      END
    ) AS day_specific_quantity,
    us.active,
    CASE 
      WHEN sqc.cancel_order_date = DATE(?) AND sqc.cancel_order = 1 THEN 1  
      ELSE NULL 
    END AS cancel_status,
    COALESCE(sqc.pause_subscription, us.is_pause_subscription) AS pause_status,
    f.name AS product_name,
    f.price AS product_price,
    f.discount_price AS product_discount_price,
    f.description AS product_description,
    f.perma_link AS product_permalink,
    f.ingredients AS product_ingredients,
    f.package_items_count AS product_package_items_count,
    f.weight AS product_weight,
    f.unit AS product_unit,
    f.sku_code AS product_sku_code,
    f.barcode AS product_barcode,
    f.cgst AS product_cgst,
    f.sgst AS product_sgst,
    f.subscription_type AS product_subscription_type,
    f.track_inventory AS product_track_inventory,
    f.featured AS product_featured,
    f.deliverable AS product_deliverable,
    f.restaurant_id AS product_restaurant_id,
    f.category_id AS product_category_id,
    f.subcategory_id AS product_subcategory_id,
    f.product_type_id AS product_product_type_id,
    f.hub_id AS product_hub_id,
    f.locality_id AS product_locality_id,
    f.product_brand_id AS product_brand_id,
    f.weightage AS product_weightage,
    f.status AS product_status,
    f.created_at AS product_created_at,
    f.updated_at AS product_updated_at,
    f.food_locality AS product_food_locality,
    m.id AS media_id,
    m.model_type,
    m.model_id,
    m.uuid,
    m.collection_name,
    m.name AS media_name,
    m.file_name AS media_file_name,
    m.mime_type AS media_mime_type,
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
  FROM user_subscriptions us
  LEFT JOIN subscription_quantity_changes sqc
    ON us.id = sqc.user_subscription_id
    AND (sqc.order_date = DATE(?) OR sqc.cancel_order_date = DATE(?))
  LEFT JOIN foods f
    ON us.product_id = f.id
  LEFT JOIN media m ON f.id = m.model_id AND (m.model_type = 'App\\\\Models\\\\Food')
  WHERE us.user_id = ?
    AND us.start_date <= ?
    AND (us.end_date IS NULL OR us.end_date >= ?)
    AND us.active = 1
    AND (
      us.subscription_type = 'everyday'
      OR 
      (us.subscription_type = 'alternative_day' AND DATEDIFF(?, us.start_date) % 2 = 0)
      OR 
      (us.subscription_type = 'every_3_day' AND DATEDIFF(?, us.start_date) % 3 = 0)
      OR 
      (us.subscription_type = 'every_7_day' AND DATEDIFF(?, us.start_date) % 7 = 0)
      OR 
      (us.subscription_type = 'customize' AND 
        (
          (DAYNAME(?) = 'Monday' AND us.monday_qty IS NOT NULL AND us.monday_qty > 0) OR
          (DAYNAME(?) = 'Tuesday' AND us.tuesday_qty IS NOT NULL AND us.tuesday_qty > 0) OR
          (DAYNAME(?) = 'Wednesday' AND us.wednesday_qty IS NOT NULL AND us.wednesday_qty > 0) OR
          (DAYNAME(?) = 'Thursday' AND us.thursday_qty IS NOT NULL AND us.thursday_qty > 0) OR
          (DAYNAME(?) = 'Friday' AND us.friday_qty IS NOT NULL AND us.friday_qty > 0) OR
          (DAYNAME(?) = 'Saturday' AND us.saturday_qty IS NOT NULL AND us.saturday_qty > 0) OR
          (DAYNAME(?) = 'Sunday' AND us.sunday_qty IS NOT NULL AND us.sunday_qty > 0)
        )
      )
    )
  `;

  return new Promise((resolve, reject) => {
    const queryParams = [
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      userId,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
      formattedDate,
    ];

    db.query<any[]>(query, queryParams, (error, results) => {
      if (error) {
        console.error("SQL Error:", error);
        return reject(error);
      }

      const mappedResults = results
        .filter((row) => row.cancel_status !== 1) // Exclude rows with cancel_status = 1
        .map((row) => {
          return {
            user_subscription_id: row.user_subscription_id,
            user_id: row.user_id,
            product_id: row.product_id,
            subscription_type: row.subscription_type,
            start_date: row.start_date,
            end_date: row.end_date,
            quantity: row.quantity,
            monday_qty: row.monday_qty,
            tuesday_qty: row.tuesday_qty,
            wednesday_qty: row.wednesday_qty,
            thursday_qty: row.thursday_qty,
            friday_qty: row.friday_qty,
            saturday_qty: row.saturday_qty,
            sunday_qty: row.sunday_qty,
            cancel_subscription: row.cancel_subscription,
            order_type: row.order_type,
            order_date: row?.order_date,
            is_pause_subscription: row.is_pause_subscription,
            pause_until_i_come_back: row.pause_until_i_come_back,
            pause_specific_period_startDate:
              row.pause_specific_period_startDate,
            pause_specific_period_endDate: row.pause_specific_period_endDate,
            day_specific_quantity: row.day_specific_quantity,
            active: row.active,
            cancel_status: row.cancel_status,
            pause_status: row.pause_status,
            product: {
              name: row.product_name,
              price: row.product_price,
              discount_price: row.product_discount_price,
              description: row.product_description,
              permalink: row.product_permalink,
              ingredients: row.product_ingredients,
              package_items_count: row.product_package_items_count,
              weight: row.product_weight,
              unit: row.product_unit,
              sku_code: row.product_sku_code,
              barcode: row.product_barcode,
              cgst: row.product_cgst,
              sgst: row.product_sgst,
              subscription_type: row.product_subscription_type,
              track_inventory: row.product_track_inventory,
              featured: row.product_featured,
              deliverable: row.product_deliverable,
              restaurant_id: row.product_restaurant_id,
              category_id: row.product_category_id,
              subcategory_id: row.product_subcategory_id,
              product_type_id: row.product_product_type_id,
              hub_id: row.product_hub_id,
              locality_id: row.product_locality_id,
              brand_id: row.product_brand_id,
              weightage: row.product_weightage,
              status: row.product_status,
              created_at: row.product_created_at,
              updated_at: row.product_updated_at,
              food_locality: row.product_food_locality,
            },
            media: {
              id: row.media_id,
              model_type: row.model_type,
              model_id: row.model_id,
              uuid: row.uuid,
              collection_name: row.collection_name,
              name: row.media_name,
              file_name: row.media_file_name,
              mime_type: row.media_mime_type,
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
          };
        });

      resolve(mappedResults);
    });
  });
};

export const cancelOneTimeOrderModel = (
  orderId: number
): Promise<{ success: boolean }> => {
  return new Promise(async (resolve, reject) => {
    const connection = await db.promise().getConnection();
    try {
      await connection.beginTransaction();

      const deleteFoodOrdersQuery =
        "DELETE FROM food_orders WHERE order_id = ?";
      await connection.query(deleteFoodOrdersQuery, [orderId]);

      const deleteOrdersQuery = "DELETE FROM orders WHERE id = ?";
      const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(
        deleteOrdersQuery,
        [orderId]
      );

      await connection.commit();
      connection.release();

      resolve({ success: result.affectedRows > 0 });
    } catch (error) {
      await connection.rollback();
      connection.release();
      reject(error);
    }
  });
};

export const getCalendarWiseOrdersModel = (
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  const query = `
WITH RECURSIVE calendar AS (
    SELECT DATE(?) AS calendar_date
    UNION ALL
    SELECT DATE_ADD(calendar_date, INTERVAL 1 DAY)
    FROM calendar
    WHERE calendar_date < DATE(?)
)
SELECT 
    us.id AS user_subscription_id,
    DATE(c.calendar_date) AS calendar_date,
    us.user_id,
    us.product_id,
    us.subscription_type,
    us.start_date,
    us.end_date,
    us.quantity,
    us.monday_qty,
    us.tuesday_qty,
    us.wednesday_qty,
    us.thursday_qty,
    us.friday_qty,
    us.saturday_qty,
    us.sunday_qty,
    us.cancel_subscription,
    us.is_pause_subscription,
    us.pause_until_i_come_back,
    us.pause_specific_period_startDate,
    us.pause_specific_period_endDate,
    sqc.id AS subscription_quantity_changes_id,
    sqc.cancel_order_date,
    sqc.cancel_order,
    sqc.order_type,
    sqc.order_date AS orderDate,
    COALESCE(
        sqc.quantity, 
        CASE 
            WHEN us.subscription_type = 'customize' THEN
                CASE 
                    WHEN DAYNAME(c.calendar_date) = 'Monday' THEN us.monday_qty
                    WHEN DAYNAME(c.calendar_date) = 'Tuesday' THEN us.tuesday_qty
                    WHEN DAYNAME(c.calendar_date) = 'Wednesday' THEN us.wednesday_qty
                    WHEN DAYNAME(c.calendar_date) = 'Thursday' THEN us.thursday_qty
                    WHEN DAYNAME(c.calendar_date) = 'Friday' THEN us.friday_qty
                    WHEN DAYNAME(c.calendar_date) = 'Saturday' THEN us.saturday_qty
                    WHEN DAYNAME(c.calendar_date) = 'Sunday' THEN us.sunday_qty
                    ELSE NULL
                END
            ELSE us.quantity
        END
    ) AS day_specific_quantity,
    us.active,
    CASE 
        WHEN sqc.cancel_order_date IS NOT NULL 
             AND DATE(sqc.cancel_order_date) = DATE(c.calendar_date) 
             AND sqc.cancel_order = 1 THEN 1  
        ELSE NULL 
    END AS cancel_status,
    COALESCE(sqc.pause_subscription, us.is_pause_subscription) AS pause_status,
    f.name AS name,
    f.price AS price,
    f.discount_price AS discount_price,
    f.description AS product_description,
    f.perma_link AS description,
    f.weight AS weight,
    f.unit AS unit,
    f.sku_code AS product_sku_code,
    f.barcode AS product_barcode,
    f.cgst AS product_cgst,
    f.sgst AS product_sgst,
    f.subscription_type AS product_subscription_type,
    f.track_inventory AS product_track_inventory,
    f.featured AS product_featured,
    f.deliverable AS product_deliverable,
    f.restaurant_id AS product_restaurant_id,
    f.category_id AS product_category_id,
    f.subcategory_id AS product_subcategory_id,
    f.product_type_id AS product_product_type_id,
    f.hub_id AS product_hub_id,
    f.locality_id AS product_locality_id,
    f.product_brand_id AS product_brand_id,
    f.weightage AS product_weightage,
    f.status AS product_status,
    f.created_at AS product_created_at,
    f.updated_at AS product_updated_at,
    f.food_locality AS product_food_locality,
    m.id AS media_id,
    m.model_type,
    m.model_id,
    m.uuid,
    m.collection_name,
    m.name AS media_name,
    m.file_name AS media_file_name,
    m.mime_type AS media_mime_type,
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
FROM calendar c
LEFT JOIN user_subscriptions us
    ON us.start_date <= c.calendar_date
    AND (us.end_date IS NULL OR us.end_date >= c.calendar_date)
    AND us.active = 1
    AND us.user_id = ?
LEFT JOIN subscription_quantity_changes sqc
    ON us.id = sqc.user_subscription_id
    AND (
        sqc.cancel_order_date = c.calendar_date 
        AND sqc.cancel_order = 1
        OR (sqc.order_date = c.calendar_date AND sqc.cancel_order_date IS NULL)
    )
LEFT JOIN foods f
    ON us.product_id = f.id
LEFT JOIN media m
    ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
WHERE (
    us.subscription_type = 'everyday'
    OR (us.subscription_type = 'alternative_day' AND MOD(DATEDIFF(c.calendar_date, us.start_date), 2) = 0)
    OR (us.subscription_type = 'every_3_day' AND MOD(DATEDIFF(c.calendar_date, us.start_date), 3) = 0)
    OR (us.subscription_type = 'every_7_day' AND MOD(DATEDIFF(c.calendar_date, us.start_date), 7) = 0)
    OR (us.subscription_type = 'customize')
)
ORDER BY c.calendar_date ASC;
  `;

  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      query,
      [formattedStartDate, formattedEndDate, userId],
      (error, results) => {
        if (error) {
          console.error("SQL Error:", error);
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

export const getCalendarOneTimeOrdersModel = (
  userId: number,
  startDate: Date,
  endDate: Date
): Promise<any[]> => {
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  const query = `
    WITH RECURSIVE calendar AS (
        SELECT DATE(?) AS calendar_date
        UNION ALL
        SELECT DATE_ADD(calendar_date, INTERVAL 1 DAY)
        FROM calendar
        WHERE calendar_date < DATE(?)
    )
    SELECT 
        c.calendar_date,
        o.id AS order_id,
        o.order_date,
        o.order_type,
        o.order_status_id,
        o.tax,
        o.delivery_fee,
        fo.price AS item_price,
        fo.quantity,
        f.name AS food_name,
        f.price AS food_price,
        f.discount_price,
        f.description,
        f.sku_code,
        f.barcode,
       f.unit AS unit,
        f.status AS food_status,
        f.created_at AS food_created_at,
        m.id AS media_id,
        m.file_name AS media_file_name,
        m.mime_type AS media_mime_type,
        CASE 
            WHEN m.conversions_disk = 'public1' 
            THEN CONCAT('https://media-image-upload.s3.ap-south-1.amazonaws.com/foods/', m.file_name)
            ELSE CONCAT('https://vrindavanmilk.com/storage/app/public/', m.id, '/', m.file_name)
        END AS original_url
    FROM calendar c
    LEFT JOIN orders o
        ON DATE(o.order_date) = c.calendar_date
        AND o.order_type = '1'
        AND o.user_id = ?
    LEFT JOIN food_orders fo
        ON fo.order_id = o.id
    LEFT JOIN foods f
        ON f.id = fo.food_id
    LEFT JOIN media m
        ON f.id = m.model_id 
        AND m.model_type = 'App\\\\Models\\\\Food'
    ORDER BY c.calendar_date ASC, o.id ASC;
  `;

  return new Promise((resolve, reject) => {
    db.query<RowDataPacket[]>(
      query,
      [formattedStartDate, formattedEndDate, userId],
      (error, results) => {
        if (error) {
          console.error("SQL Error:", error);
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};
