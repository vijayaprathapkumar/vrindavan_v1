// controllers/cronLogsController.ts
import { Request, Response } from "express";
import { getCronLogs } from "../../models/cronLogsModel/cronLogsModel";
import { createResponse } from "../../utils/responseHandler";

export const getCronLogsController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const searchTerm = req.query.searchTerm as string;
    const sortField = req.query.sortField as string;
    const sortOrder = req.query.sortOrder as string;

    const { cronLogs, totalCount, totalPages } = await getCronLogs({
      page,
      limit,
      startDate,
      endDate,
      searchTerm,
      sortField,
      sortOrder,
    });

    res.status(200).json(
      createResponse(200, "Cron Logs fetched successfully", {
        cronLogs,
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      })
    );
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Error fetching cron logs" });
  }
};
