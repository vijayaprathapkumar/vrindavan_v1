// models/cronLogsModel.ts

import { RowDataPacket } from "mysql2";
import { db } from "../../config/databaseConnection";

interface CronLog extends RowDataPacket {
  id: number;
  log_date: string;
  cron_logs: string;
  created_at: string;
  updated_at: string;
}

interface ParsedCronLog {
  jobType: string;
  jobStart: string;
  jobEnd: string;
  duration: string;
  message: string;
  status: string;
}

export const getCronLogs = async ({
  page,
  limit,
  startDate,
  endDate,
  searchTerm,
  sortField,
  sortOrder,
}: {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  sortField?: string;
  sortOrder?: string;
}) => {
  const offset = (page - 1) * limit;

  let query = `SELECT id, log_date, cron_logs, created_at, updated_at FROM cron_logs`;
  const whereClauses: string[] = [];
  const whereParams: any[] = [];

  // Handle date filtering
  if (startDate && endDate) {
    whereClauses.push(`log_date BETWEEN ? AND ?`);
    whereParams.push(startDate.toISOString(), endDate.toISOString());
  } else if (startDate) {
    whereClauses.push(`log_date >= ?`);
    whereParams.push(startDate.toISOString());
  } else if (endDate) {
    whereClauses.push(`log_date <= ?`);
    whereParams.push(endDate.toISOString());
  }

  // Search filter
  if (searchTerm) {
    whereClauses.push(`cron_logs LIKE ?`);
    whereParams.push(`%${searchTerm}%`);
  }

  // Add WHERE clause if needed
  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  // Sorting
  const allowedSortFields: Record<string, string> = {
    log_date: "log_date",
    jobType: "cron_logs",
    jobStart: "cron_logs",
    jobEnd: "cron_logs",
    duration: "cron_logs",
    status: "cron_logs",
  };

  let orderByClause = ` ORDER BY created_at DESC`;
  if (sortField && allowedSortFields[sortField]) {
    const validSortOrder = sortOrder === "desc" ? "DESC" : "ASC";
    orderByClause = ` ORDER BY ${allowedSortFields[sortField]} ${validSortOrder}`;
  }

  query += orderByClause + ` LIMIT ?, ?`;
  const queryParams = [...whereParams, offset, limit];

  try {
    const [rows] = await db.promise().query<CronLog[]>(query, queryParams);

    // Count total rows
    const countQuery =
      `SELECT COUNT(*) as total FROM cron_logs` +
      (whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "");
    const [countResult] = await db
      .promise()
      .query<RowDataPacket[]>(countQuery, whereParams);

    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Parse and filter results
    const cronLogs = rows
      .map((row) => {
        const parsed = parseCronLog(row.cron_logs);
        return { ...row, ...parsed };
      })
      .filter((log) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          log.jobType?.toLowerCase().includes(term) ||
          log.jobStart?.toLowerCase().includes(term) ||
          log.jobEnd?.toLowerCase().includes(term) ||
          log.duration?.toLowerCase().includes(term) ||
          log.status?.toLowerCase().includes(term) ||
          log.message?.toLowerCase().includes(term)
        );
      });

    return {
      cronLogs,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching cron logs:", error);
    throw error;
  }
};

const parseCronLog = (log: string): ParsedCronLog => {
  const regex =
    /Job Start: ([^,]+), Job End: ([^,]+), Duration: (\d+)s, Message: (.+)/;
  const match = log.match(regex);

  if (match) {
    const jobTypeLog = log.includes("orders bill")
      ? "Billing generation"
      : log.includes("orders placed")
      ? "Order generation"
      : "Unknown";

    return {
      jobType: jobTypeLog,
      jobStart: match[1],
      jobEnd: match[2],
      duration: match[3].concat("s"),
      message: match[4],
      status: "Success",
    };
  } else if (log) {
    const jobTypeLog = log.includes("orders bill")
      ? "Billing generation"
      : log.includes("orders placed")
      ? "Order generation"
      : "Unknown";

    return {
      jobType: jobTypeLog,
      jobStart: "",
      jobEnd: "",
      duration: "",
      message: "",
      status: "Unknown",
    };
  }
};
