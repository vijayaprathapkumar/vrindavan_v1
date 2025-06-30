import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";
import cron from "node-cron";

export const getMonthlyCommissionPayouts = async (
  month: number,
  year: number,
  limit: number,
  offset: number,
  sortField: string,
  sortOrder: string,
  searchTerm: string
): Promise<{ commissionPayouts: any[]; totalCount: number }> => {
  const allowedSortFields = ["total_commission", "delivery_boy_name"];
  const sortClause = allowedSortFields.includes(sortField)
    ? `${sortField} ${sortOrder === "desc" ? "desc" : "asc"}`
    : "db.name asc";

  const searchClause = searchTerm
    ? `AND (db.name LIKE ? OR mc.total_commission LIKE ?)`
    : "";

  const query = `
        SELECT
          db.id AS delivery_boy_id,
          db.name AS delivery_boy_name,
          db.mobile AS delivery_boy_mobile,
          mc.id AS monthly_commission_id,
          mc.total_commission AS monthly_commission,
          mc.month,
          mc.year
        FROM
          delivery_boys db
        LEFT JOIN
          monthly_commission mc ON db.user_id = mc.delivery_boy_id AND mc.month = ? AND mc.year = ?
        WHERE
          1 = 1
          ${searchClause}
        ORDER BY ${sortClause}
        LIMIT ? OFFSET ?;
      `;

  const countQuery = `
        SELECT
          COUNT(DISTINCT db.id) AS totalCount
        FROM
          delivery_boys db
        LEFT JOIN
          monthly_commission mc ON db.user_id = mc.delivery_boy_id AND mc.month = ? AND mc.year = ?
        WHERE
          1 = 1
          ${searchClause}
      `;

  const detailsQuery = `
        SELECT
          dc.id AS detailed_commission_id,
          dc.product_id,
          dc.quantity,
          dc.commission,
          dc.total_commission AS detailed_total_commission,
          f.name AS food_name,
          f.unit AS food_unit
        FROM
          detailed_commission dc
        LEFT JOIN
          foods f ON dc.product_id = f.id
        WHERE
          dc.monthly_commission_id = ?
      `;

  try {
    const queryParams = [
      month,
      year,
      ...(searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`] : []),
      limit,
      offset,
    ];

    const [rows] = await db
      .promise()
      .query<RowDataPacket[]>(query, queryParams);

    const countParams = [
      month,
      year,
      ...(searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`] : []),
    ];

    const [[{ totalCount }]] = await db
      .promise()
      .query<RowDataPacket[]>(countQuery, countParams);

    const commissionPayouts = await Promise.all(
      rows.map(async (row) => {
        const [details] = await db
          .promise()
          .query<RowDataPacket[]>(detailsQuery, [row.monthly_commission_id]);

        return {
          id: row.delivery_boy_id,
          name: row.delivery_boy_name,
          mobile: row.delivery_boy_mobile,
          monthly_commission: row.monthly_commission,
          details: details.map((detail) => ({
            detailed_commission_id: detail.detailed_commission_id,
            product_id: detail.product_id,
            quantity: detail.quantity,
            commission: detail.commission,
            detailed_total_commission: detail.detailed_total_commission,
            food_name: detail.food_name,
            food_unit: detail.food_unit,
          })),
        };
      })
    );

    return {
      commissionPayouts,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching monthly commission payouts:", error);
    throw new Error("Failed to fetch monthly commission payouts.");
  }
};

export const calculateMonthlyCommissions = async () => {
  const today = new Date();

  // Get the first day of the previous month
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const month = previousMonthDate.getMonth() + 1;
  const year = previousMonthDate.getFullYear();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // last day of the month

  try {
    const [rows] = await db.promise().query<any[]>(
      `
      SELECT 
        o.delivery_boy_id,
        fo.food_id AS product_id,
        SUM(fo.quantity) AS total_quantity
      FROM orders o
      JOIN food_orders fo ON o.id = fo.order_id
      WHERE o.order_date BETWEEN ? AND ?
      GROUP BY o.delivery_boy_id, fo.food_id
    `,
      [startDate, endDate]
    );

    const deliveryBoyCommissions: Record<
      string,
      {
        monthlyId: number | null;
        totalCommission: number;
        details: Array<{
          product_id: number;
          quantity: number;
          commission: number;
          total: number;
        }>;
      }
    > = {};

    for (const row of rows) {
      const { delivery_boy_id, product_id, total_quantity } = row;

      if (delivery_boy_id == null) {
        console.warn(
          `⚠️ Skipping row with null delivery_boy_id for product_id: ${product_id}`
        );
        continue;
      }

      const [[special]] = await db
        .promise()
        .query<any[]>(
          `SELECT special_commission FROM special_commissions WHERE delivery_boy_id = ? AND product_id = ? LIMIT 1`,
          [delivery_boy_id, product_id]
        );

      let commissionRate = special?.special_commission;

      if (!commissionRate) {
        const [[standard]] = await db
          .promise()
          .query<any[]>(
            `SELECT commission FROM standard_commissions WHERE product_id = ? LIMIT 1`,
            [product_id]
          );
        commissionRate = standard?.commission;
      }

      if (!commissionRate) continue;

      const total = parseFloat(commissionRate) * total_quantity;

      if (!deliveryBoyCommissions[delivery_boy_id]) {
        deliveryBoyCommissions[delivery_boy_id] = {
          monthlyId: null,
          totalCommission: 0,
          details: [],
        };
      }

      deliveryBoyCommissions[delivery_boy_id].totalCommission += total;
      deliveryBoyCommissions[delivery_boy_id].details.push({
        product_id,
        quantity: total_quantity,
        commission: parseFloat(commissionRate),
        total,
      });
    }

    for (const [delivery_boy_id, data] of Object.entries(deliveryBoyCommissions)) {
      const [monthlyResult] = await db
        .promise()
        .query<any[]>(
          `SELECT id FROM monthly_commission WHERE delivery_boy_id = ? AND month = ? AND year = ?`,
          [delivery_boy_id, month, year]
        );

      let monthlyId = monthlyResult[0]?.id;

      if (!monthlyId) {
        const [insertMonthly] = await db
          .promise()
          .query<any>(
            `INSERT INTO monthly_commission (delivery_boy_id, month, year, total_commission, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [delivery_boy_id, month, year, data.totalCommission]
          );
        monthlyId = insertMonthly.insertId;
      } else {
        await db
          .promise()
          .query(
            `UPDATE monthly_commission SET total_commission = ?, updated_at = NOW() WHERE id = ?`,
            [data.totalCommission, monthlyId]
          );
      }

      for (const detail of data.details) {
        await db
          .promise()
          .query(
            `INSERT INTO detailed_commission (monthly_commission_id, delivery_boy_id, product_id, quantity, commission, total_commission, month, year, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              monthlyId,
              delivery_boy_id,
              detail.product_id,
              detail.quantity,
              detail.commission,
              detail.total,
              month,
              year,
            ]
          );
      }
    }

    console.log(
      `✅ Commission calculation for ${month}/${year} completed. Total delivery boys processed: ${Object.keys(deliveryBoyCommissions).length}`
    );
  } catch (err) {
    console.error("❌ Error calculating commissions:", err);
  }
};


export const commissionCronJob = () => {
  cron.schedule("10 0 1 * *", async () => {
    console.log("📆 Running monthly commission cron...");
    await calculateMonthlyCommissions();
  });
};
