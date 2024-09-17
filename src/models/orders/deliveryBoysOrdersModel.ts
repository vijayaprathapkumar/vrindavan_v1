import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

// Fetch all delivery boy orders with complete user data
export const getAllDeliveryBoyOrders = async (): Promise<any[]> => {
    try {
      const [rows] = await db.promise().query<RowDataPacket[]>(`
        SELECT
          o.id AS order_id,
          o.user_id AS order_user_id,
          o.route_id AS order_route_id,
          o.hub_id AS order_hub_id,
          o.locality_id AS order_locality_id,
          o.delivery_boy_id AS order_delivery_boy_id,
          o.order_status_id AS order_status_id,
          o.tax AS order_tax,
          o.delivery_fee AS order_delivery_fee,
          o.active AS order_active,
          o.driver_id AS order_driver_id,
          o.delivery_address_id AS order_delivery_address_id,
          o.payment_id AS order_payment_id,
          o.is_wallet_deduct AS order_is_wallet_deduct,
          o.delivery_status AS order_delivery_status,
          o.created_at AS order_created_at,
          o.updated_at AS order_updated_at,
          f.id AS food_id,
          f.name AS food_name,
          f.price AS food_price,
          f.discount_price AS food_discount_price,
          f.description AS food_description,
          f.perma_link AS food_perma_link,
          f.unit AS food_unit,
          fo.quantity AS food_quantity,
          fo.price AS food_price,
          l.id AS locality_id,
          l.route_id AS locality_route_id,
          l.hub_id AS locality_hub_id,
          l.name AS locality_name,
          l.address AS locality_address,
          l.google_address AS locality_google_address,
          l.latitude AS locality_latitude,
          l.longitude AS locality_longitude,
          l.city AS locality_city,
          p.id AS payment_id,
          p.price AS payment_price,
          p.description AS payment_description,
          p.user_id AS payment_user_id,
          p.status AS payment_status,
          p.method AS payment_method,
          p.created_at AS payment_created_at,
          p.updated_at AS payment_updated_at,
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.phone AS user_phone,
          u.api_token AS user_api_token,
          u.device_token AS user_device_token,
          u.delivery_priority AS user_delivery_priority,
          u.credit_limit AS user_credit_limit,
          da.id AS delivery_address_id,
          da.description AS delivery_address_description,
          da.address AS delivery_address_address,
          da.latitude AS delivery_address_latitude,
          da.longitude AS delivery_address_longitude,
          da.house_no AS delivery_address_house_no,
          da.complete_address AS delivery_address_complete_address
        FROM orders o
        LEFT JOIN food_orders fo ON o.id = fo.order_id
        LEFT JOIN foods f ON fo.food_id = f.id
        LEFT JOIN localities l ON o.locality_id = l.id
        LEFT JOIN payments p ON o.payment_id = p.id
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN delivery_addresses da ON o.delivery_address_id = da.id
        ORDER BY o.id, f.id;
      `);
  
      const structuredData = rows.reduce((acc: any[], row: any) => {
        let order = acc.find((order: any) => order.order_id === row.order_id);
        if (!order) {
          order = {
            order_id: row.order_id,
            user: {
              id: row.user_id,
              name: row.user_name,
              phone: row.user_phone,
              email: row.user_email,
              api_token: row.user_api_token,
              device_token: row.user_device_token,
              delivery_priority: row.user_delivery_priority,
              credit_limit: row.user_credit_limit
            },
            delivery_address: row.delivery_address_id ? {
              id: row.delivery_address_id,
              description: row.delivery_address_description,
              address: row.delivery_address_address,
              latitude: row.delivery_address_latitude,
              longitude: row.delivery_address_longitude,
              house_no: row.delivery_address_house_no,
              complete_address: row.delivery_address_complete_address
            } : null,
            locality: {
              id: row.locality_id,
              name: row.locality_name,
              address: row.locality_address,
              google_address: row.locality_google_address,
              latitude: row.locality_latitude,
              longitude: row.locality_longitude,
              city: row.locality_city
            },
            payment: {
              id: row.payment_id,
              price: row.payment_price,
              description: row.payment_description,
              status: row.payment_status,
              method: row.payment_method
            },
            foods: []
          };
          acc.push(order);
        }
  
        if (row.food_id && !order.foods.some((food: any) => food.id === row.food_id)) {
          order.foods.push({
            id: row.food_id,
            name: row.food_name,
            unit: row.food_unit,
            quantity: row.food_quantity,
            price: row.food_price,
            product_type: {
              name: row.product_type_name,
              weightage: row.product_type_weightage
            }
          });
        }
  
        return acc;
      }, []);
  
      return structuredData;
    } catch (error) {
      console.error("Error fetching orders with users and other details:", error);
      throw error;
    }
  };
