"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCronLogsController = void 0;
const cronLogsModel_1 = require("../../models/cronLogsModel/cronLogsModel");
const responseHandler_1 = require("../../utils/responseHandler");
const getCronLogsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate
            ? new Date(req.query.startDate)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate)
            : undefined;
        const searchTerm = req.query.searchTerm;
        const sortField = req.query.sortField;
        const sortOrder = req.query.sortOrder;
        const { cronLogs, totalCount, totalPages } = await (0, cronLogsModel_1.getCronLogs)({
            page,
            limit,
            startDate,
            endDate,
            searchTerm,
            sortField,
            sortOrder,
        });
        res.status(200).json((0, responseHandler_1.createResponse)(200, "Cron Logs fetched successfully", {
            cronLogs,
            totalCount,
            totalPages,
            currentPage: page,
            limit,
        }));
    }
    catch (error) {
        return res
            .status(500)
            .json({ status: "error", message: "Error fetching cron logs" });
    }
};
exports.getCronLogsController = getCronLogsController;
