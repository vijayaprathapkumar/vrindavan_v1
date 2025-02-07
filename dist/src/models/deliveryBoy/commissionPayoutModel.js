"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyCommissionPayouts = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getMonthlyCommissionPayouts = async (month, year, limit, offset, sortField, sortOrder, searchTerm) => {
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
        const [rows] = await databaseConnection_1.db
            .promise()
            .query(query, queryParams);
        const countParams = [
            month,
            year,
            ...(searchTerm ? [`%${searchTerm}%`, `%${searchTerm}%`] : []),
        ];
        const [[{ totalCount }]] = await databaseConnection_1.db
            .promise()
            .query(countQuery, countParams);
        const commissionPayouts = await Promise.all(rows.map(async (row) => {
            const [details] = await databaseConnection_1.db
                .promise()
                .query(detailsQuery, [row.monthly_commission_id]);
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
        }));
        return {
            commissionPayouts,
            totalCount,
        };
    }
    catch (error) {
        console.error("Error fetching monthly commission payouts:", error);
        throw new Error("Failed to fetch monthly commission payouts.");
    }
};
exports.getMonthlyCommissionPayouts = getMonthlyCommissionPayouts;
