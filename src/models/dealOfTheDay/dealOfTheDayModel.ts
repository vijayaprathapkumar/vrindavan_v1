import { db } from "../../config/databaseConnection";
import { RowDataPacket, OkPacket, ResultSetHeader } from "mysql2";

export interface DealOfTheDay {
  id: number;
  foodId: string;
  food_name: any;
  unit: string;
  price: number;
  offer_price: number;
  quantity: number;
  description?: string;
  status: number;
  weightage?: number;
  created_at?: Date;
  updated_at?: Date;
  media?: any;
}

// Fetch all deals
export const getAllDeals = async (
  page: number,
  limit: number,
  searchTerm: string,
  sortField: string,
  sortOrder: string
): Promise<{ deals: DealOfTheDay[]; total: number }> => {
  const offset = (page - 1) * limit;

  const validSortFields: Record<string, string> = {
    foodId: "f.id",
    food_name: "f.name",
    unit: "d.unit",
    price: "d.price",
    offer_price: "d.offer_price",
    weightage: "CAST(d.weightage AS UNSIGNED)",
    status: "d.status",
  };

  let query = `
    SELECT 
      d.id AS deal_id,
      d.food_id,
      f.name AS food_name,
      d.unit,
      d.price,
      d.offer_price,
      d.quantity,
      d.description,
      d.status,
      d.weightage,
      d.created_at AS deal_created_at,
      d.updated_at AS deal_updated_at,
      m.id AS media_id,
      m.model_type,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size AS media_size,
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
    FROM 
      deal_of_the_days d
    JOIN 
      foods f ON d.food_id = f.id 
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      d.id IS NOT NULL AND d.quantity > 0
  `;

  const params: any[] = [];

  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm === "active") {
      query += ` AND d.status = ?`;
      params.push(1);
    } else if (lowerSearchTerm === "inactive") {
      query += ` AND d.status = ?`;
      params.push(0);
    } else {
      query += ` AND (f.name LIKE ? OR f.id LIKE ? OR d.unit LIKE ? OR d.price LIKE ? OR d.offer_price LIKE ?)`;
      params.push(
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      );
    }
  }

  query += ` ORDER BY ${validSortFields[sortField] || "d.id"} ${
    sortOrder === "desc" ? "DESC" : "ASC"
  } LIMIT ? OFFSET ?`;

  params.push(limit, offset);

  const [rows]: [RowDataPacket[], any] = await db
    .promise()
    .query(query, params);

  // Count query
  let totalCountQuery = `
    SELECT COUNT(*) AS total 
    FROM deal_of_the_days d
    JOIN foods f ON d.food_id = f.id
    LEFT JOIN media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE d.quantity > 0
  `;

  const countParams: any[] = [];

  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm === "active") {
      totalCountQuery += ` AND d.status = ?`;
      countParams.push(1);
    } else if (lowerSearchTerm === "inactive") {
      totalCountQuery += ` AND d.status = ?`;
      countParams.push(0);
    } else {
      totalCountQuery += ` AND (f.name LIKE ? OR f.id LIKE ? OR d.unit LIKE ? OR d.price LIKE ? OR d.offer_price LIKE ?)`;
      countParams.push(
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      );
    }
  }

  const [totalCountRows]: [RowDataPacket[], any] = await db
    .promise()
    .query(totalCountQuery, countParams);

  const totalCount = totalCountRows[0]?.total || 0;

  return {
    deals: rows.map((row) => ({
      id: row.deal_id,
      foodId: row.food_id,
      food_name: row.food_name,
      unit: row.unit,
      price: row.price,
      offer_price: row.offer_price,
      quantity: row.quantity,
      description: row.description,
      status: row.status,
      weightage: row.weightage,
      created_at: row.deal_created_at,
      updated_at: row.deal_updated_at,
      media: {
        id: row.media_id,
        model_type: row.model_type,
        uuid: row.uuid,
        collection_name: row.collection_name,
        name: row.media_name,
        file_name: row.file_name,
        mime_type: row.mime_type,
        disk: row.disk,
        conversions_disk: row.conversions_disk,
        size: row.media_size,
        manipulations: row.manipulations,
        custom_properties: row.custom_properties,
        generated_conversions: row.generated_conversions,
        responsive_images: row.responsive_images,
        order_column: row.order_column,
        created_at: row.media_created_at,
        updated_at: row.media_updated_at,
        original_url: row.original_url,
      },
    })),
    total: totalCount,
  };
};

// Create a new deal
export const createDeal = async (dealData: {
  foodId: string;
  unit: string;
  price: number;
  offer_price: number;
  quantity: number;
  description?: string;
  status: number;
  weightage?: number;
}) => {
  const {
    foodId,
    unit,
    price,
    offer_price,
    quantity,
    description,
    status,
    weightage,
  } = dealData;

  if (!foodId || !price || !offer_price || !quantity) {
    throw new Error(
      "Missing required fields: foodId, price, offerPrice, or quantity."
    );
  }

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert deal into deal_of_the_days
    const insertSql = `
      INSERT INTO deal_of_the_days 
      (food_id, unit, price, offer_price, quantity, description, status, weightage, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW());
    `;

    const insertValues = [
      foodId,
      unit,
      price,
      offer_price,
      quantity,
      description || null,
      status,
      weightage || null,
    ];

    await connection.query(insertSql, insertValues);

    // 2. Update discount_price in foods table
    const updateDiscountSql = `
      UPDATE foods
      SET discount_price = ?
      WHERE id = ?;
    `;
    await connection.query(updateDiscountSql, [offer_price, foodId]);

    // 3. If quantity is 0, update foods table to match price and clear discount
    if (quantity === 0) {
      const resetSql = `
        UPDATE foods
        SET price = ?, discount_price = NULL
        WHERE id = ?;
      `;
      await connection.query(resetSql, [price, foodId]);
    }

    await connection.commit();
    return { message: "Deal created and food updated successfully." };
  } catch (error) {
    await connection.rollback();
    throw new Error("Failed to create deal and update food.");
  } finally {
    connection.release();
  }
};

// Fetch a deal by ID
export const getDealById = async (id: number): Promise<DealOfTheDay | null> => {
  const query = `
    SELECT 
      d.id AS deal_id,
      d.food_id,
      f.name AS food_name,  -- Add the food name if needed
      d.unit,
      d.price,
      d.offer_price,
      d.quantity,
      d.description,
      d.status,
      d.weightage,
      d.created_at AS deal_created_at,
      d.updated_at AS deal_updated_at,
      m.id AS media_id,
      m.model_type,
      m.uuid,
      m.collection_name,
      m.name AS media_name,
      m.file_name,
      m.mime_type,
      m.disk,
      m.conversions_disk,
      m.size AS media_size,
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
    FROM 
      deal_of_the_days d
    JOIN 
      foods f ON d.food_id = f.id  -- Joining foods table to get food details
    LEFT JOIN 
      media m ON f.id = m.model_id AND m.model_type = 'App\\\\Models\\\\Food'
    WHERE 
      d.id = ?;
  `;

  const [rows] = await db.promise().query<RowDataPacket[]>(query, [id]);

  if (rows.length === 0) return null;

  return {
    id: rows[0].deal_id,
    foodId: rows[0].food_id,
    food_name: rows[0].food_name, // Include food_name in the return value
    unit: rows[0].unit,
    price: rows[0].price,
    offer_price: rows[0].offer_price,
    quantity: rows[0].quantity,
    description: rows[0].description,
    status: rows[0].status,
    weightage: rows[0].weightage,
    created_at: rows[0].deal_created_at,
    updated_at: rows[0].deal_updated_at,
    media: {
      id: rows[0].media_id,
      model_type: rows[0].model_type,
      uuid: rows[0].uuid,
      collection_name: rows[0].collection_name,
      name: rows[0].media_name,
      file_name: rows[0].file_name,
      mime_type: rows[0].mime_type,
      disk: rows[0].disk,
      conversions_disk: rows[0].conversions_disk,
      size: rows[0].media_size,
      manipulations: rows[0].manipulations,
      custom_properties: rows[0].custom_properties,
      generated_conversions: rows[0].generated_conversions,
      responsive_images: rows[0].responsive_images,
      order_column: rows[0].order_column,
      created_at: rows[0].media_created_at,
      updated_at: rows[0].media_updated_at,
      original_url: rows[0].original_url,
    },
  };
};

// Update a deal
export const updateDeals = async (
  id: number,
  dealData: {
    foodId?: string;
    unit?: string;
    price?: number;
    offer_price?: number;
    quantity?: number;
    description?: string;
    status?: number;
    weightage?: number;
  }
): Promise<ResultSetHeader> => {
  const {
    foodId,
    unit,
    price,
    offer_price,
    quantity,
    description,
    status,
    weightage,
  } = dealData;

  let sql = "UPDATE deal_of_the_days SET ";
  const updates: string[] = [];
  const params: any[] = [];

  if (foodId) {
    updates.push("food_id = COALESCE(?, food_id)");
    params.push(foodId);
  }
  if (unit) {
    updates.push("unit = COALESCE(?, unit)");
    params.push(unit);
  }
  if (price !== undefined) {
    updates.push("price = COALESCE(?, price)");
    params.push(price);
  }
  if (offer_price !== undefined) {
    updates.push("offer_price = COALESCE(?, offer_price)");
    params.push(offer_price);
  }
  if (quantity !== undefined) {
    updates.push("quantity = COALESCE(?, quantity)");
    params.push(quantity);
  }
  if (description) {
    updates.push("description = COALESCE(?, description)");
    params.push(description);
  }
  if (status !== undefined) {
    updates.push("status = COALESCE(?, status)");
    params.push(status);
  }
  if (weightage !== undefined) {
    updates.push("weightage = COALESCE(?, weightage)");
    params.push(weightage);
  }

  sql += updates.join(", ") + " WHERE id = ?;";
  params.push(id);

  const [result] = await db.promise().query<ResultSetHeader>(sql, params);
  return result;
};

// Delete a deal

export const deleteDealById = async (id: number): Promise<ResultSetHeader> => {
  const sql = "DELETE FROM deal_of_the_days WHERE id = ?;";
  const [result] = await db.promise().query<ResultSetHeader>(sql, [id]);
  return result;
};

export const getDealByFoodId = async (
  foodId: number
): Promise<RowDataPacket | null> => {
  const sql = `
    SELECT * FROM deal_of_the_days WHERE food_id = ? AND status = 1;
  `;
  const [rows] = await db.promise().query<RowDataPacket[]>(sql, [foodId]);
  return rows.length ? rows[0] : null;
};

export const updateDealQuantity = async (
  foodId: number,
  quantityOrdered: number
) => {
  const dealSql = `SELECT quantity, status, offer_price FROM deal_of_the_days WHERE food_id = ?`;

  try {
    const [dealRows]: any = await db.promise().query(dealSql, [foodId]);

    if (dealRows.length === 0) {
      console.error(`No deal found for food_id: ${foodId}`);
      return { status: null };
    }

    const deal = dealRows[0];
    let newQuantity = deal.quantity - quantityOrdered;
    let newStatus = deal.status;

    const connection = await db.promise().getConnection();
    try {
      await connection.beginTransaction();

      if (newQuantity <= 0) {
        newQuantity = 0;
        newStatus = 0;

        await connection.query(
          `UPDATE deal_of_the_days SET quantity = ?, status = 0 WHERE food_id = ?`,
          [newQuantity, foodId]
        );

        await connection.query(
          `UPDATE foods SET discount_price = price WHERE id = ?`,
          [foodId]
        );
      } else {
        await connection.query(
          `UPDATE deal_of_the_days SET quantity = ? WHERE food_id = ?`,
          [newQuantity, foodId]
        );

        await connection.query(
          `UPDATE foods SET discount_price = ? WHERE id = ?`,
          [deal.offer_price, foodId]
        );
      }

      await connection.commit();
      return { status: newStatus, quantity: newQuantity };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating deal quantity:", error);
    throw new Error("Error updating deal quantity.");
  }
};

export const updateFoodDiscountPrice = async (
  food_id: number,
  offer_price: number
) => {
  const sql = `UPDATE foods SET discount_price = ? WHERE id = ?`;
  await db.promise().query(sql, [offer_price, food_id]);
};

// Reset discount_price to price when deal ends
export const resetFoodDiscountPrice = async (food_id: number) => {
  const sql = `UPDATE foods SET discount_price = price WHERE id = ?`;
  await db.promise().query(sql, [food_id]);
};
