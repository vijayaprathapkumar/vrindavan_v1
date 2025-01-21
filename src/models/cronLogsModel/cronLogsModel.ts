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
}: {
  page: number;
  limit: number;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}) => {
  const offset = (page - 1) * limit;

  let query = `SELECT id, log_date, cron_logs, created_at, updated_at FROM cron_logs`;

  if (startDate && endDate) {
    query += ` WHERE log_date BETWEEN ? AND ?`;
  } else if (startDate) {
    query += ` WHERE log_date >= ?`;
  } else if (endDate) {
    query += ` WHERE log_date <= ?`;
  }

  if (searchTerm) {
    query += ` AND cron_logs LIKE ?`;
  }

  query += ` ORDER BY created_at DESC LIMIT ?, ?`;

  try {
    const params: any[] = [];

    if (startDate) params.push(startDate.toISOString());
    if (endDate) params.push(endDate.toISOString());
    if (searchTerm) params.push(`%${searchTerm}%`);
    params.push(offset, limit);

    const [rows] = await db.promise().query<CronLog[]>(query, params);

    const [countResult] = await db
      .promise()
      .query<RowDataPacket[]>(`SELECT COUNT(*) as total FROM cron_logs`, []);

    const totalCount = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Map over the logs to parse them
    const cronLogs = rows.map((row) => {
      const parsedLog = parseCronLog(row.cron_logs);
      return {
        ...row,
        ...parsedLog,
      };
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
