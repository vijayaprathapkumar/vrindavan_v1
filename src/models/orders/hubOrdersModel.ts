import { db } from "../../config/databaseConnection";
import { RowDataPacket } from "mysql2";

export const getAllHubOrders = async (): Promise<any[]> => {
  try {
    const [rows] = await db.promise().query<RowDataPacket[]>(`
      SELECT
        r1.id AS route_id,
        r1.name AS route_name,
        h.id AS hub_id,
        h.name AS hub_name,
        h.other_details AS hub_other_details,
        db.id AS delivery_boy_id,
        db.name AS delivery_boy_name,
        f.id AS food_id,
        f.name AS food_name,
        f.unit AS food_unit,
        fo.quantity AS food_quantity,
        fo.price AS food_price,  -- Using the price field
        f.weightage AS food_weightage,
        pt.id AS product_type_id,
        pt.name AS product_type_name,
        pt.weightage AS product_type_weightage
      FROM orders o
      LEFT JOIN truck_routes r1 ON o.route_id = r1.id
      LEFT JOIN hubs h ON o.hub_id = h.id
      LEFT JOIN food_orders fo ON o.id = fo.order_id
      LEFT JOIN foods f ON fo.food_id = f.id
      LEFT JOIN product_types pt ON f.product_type_id = pt.id
      LEFT JOIN delivery_boys db ON o.delivery_boy_id = db.id  -- Joining delivery boys table
      ORDER BY o.id, f.id;
    `);

    const structuredData = rows.map((row: any) => ({
      Route: row.route_name,
      Hub: row.hub_name,
      "Product Name": row.food_name,
      "Unit Size": row.food_unit,
      Quantity: row.food_quantity,
      Price: row.food_price, 
      "Food Weightage": row.food_weightage,
      "Product Type": {
        id: row.product_type_id,
        name: row.product_type_name,
        weightage: row.product_type_weightage
      },
      "Delivery Boy": {
        id: row.delivery_boy_id,
        name: row.delivery_boy_name
      }
    }));

    return structuredData;
  } catch (error) {
    console.error("Error fetching hub orders:", error);
    throw error;
  }
};
