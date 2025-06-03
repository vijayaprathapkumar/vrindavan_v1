"use strict";
// models/cronLogsModel.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCronLogs = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const getCronLogs = async ({ page, limit, startDate, endDate, searchTerm, sortField, sortOrder, }) => {
    const offset = (page - 1) * limit;
    let query = `SELECT id, log_date, cron_logs, created_at, updated_at FROM cron_logs`;
    const whereClauses = [];
    const params = [];
    if (startDate && endDate) {
        whereClauses.push(`log_date BETWEEN ? AND ?`);
        params.push(startDate.toISOString(), endDate.toISOString());
    }
    else if (startDate) {
        whereClauses.push(`log_date >= ?`);
        params.push(startDate.toISOString());
    }
    else if (endDate) {
        whereClauses.push(`log_date <= ?`);
        params.push(endDate.toISOString());
    }
    if (searchTerm) {
        whereClauses.push(`cron_logs LIKE ?`);
        params.push(`%${searchTerm}%`);
    }
    // Only add WHERE clause if there are conditions to apply
    if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(" AND ")}`;
    }
    const allowedSortFields = {
        log_date: "log_date",
        jobType: "cron_logs",
        jobStart: "cron_logs",
        jobEnd: "cron_logs",
        duration: "cron_logs",
        status: "cron_logs",
    };
    let orderByClause = ` ORDER BY created_at DESC`;
    if (sortField && allowedSortFields[sortField]) {
        const validSortOrder = sortOrder === "desc" ? "desc" : "asc";
        orderByClause = ` ORDER BY ${allowedSortFields[sortField]} ${validSortOrder}`;
    }
    query += orderByClause + ` LIMIT ?, ?`;
    params.push(offset, limit);
    try {
        const [rows] = await databaseConnection_1.db.promise().query(query, params);
        const [countResult] = await databaseConnection_1.db
            .promise()
            .query(`SELECT COUNT(*) as total FROM cron_logs`, []);
        const totalCount = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);
        const cronLogs = rows
            .map((row) => {
            const parsedLog = parseCronLog(row.cron_logs);
            return { ...row, ...parsedLog };
        })
            .filter((log) => {
            if (!searchTerm)
                return true;
            const term = searchTerm.toLowerCase();
            return (log.jobType.toLowerCase().includes(term) ||
                log.jobStart.toLowerCase().includes(term) ||
                log.jobEnd.toLowerCase().includes(term) ||
                log.duration.toLowerCase().includes(term) ||
                log.status.toLowerCase().includes(term) ||
                log.message.toLowerCase().includes(term) // Include message field
            );
        });
        return {
            cronLogs,
            totalCount,
            totalPages,
        };
    }
    catch (error) {
        console.error("Error fetching cron logs:", error);
        throw error;
    }
};
exports.getCronLogs = getCronLogs;
const parseCronLog = (log) => {
    const regex = /Job Start: ([^,]+), Job End: ([^,]+), Duration: (\d+)s, Message: (.+)/;
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
    }
    else if (log) {
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
