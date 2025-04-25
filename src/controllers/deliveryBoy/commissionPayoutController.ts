import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import { getMonthlyCommissionPayouts } from "../../models/deliveryBoy/commissionPayoutModel";

export const getCommissionPayouts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const month = parseInt(req.query.month as string);
  const year = parseInt(req.query.year as string);
  const limit = parseInt(req.query.limit as string);
  const page = parseInt(req.query.page as string) || 1;
  const offset = (page - 1) * limit;
  const sortField = (req.query.sortField as string) || "";
  const sortOrder = (req.query.sortOrder as string) || "asc";
  const searchTerm = (req.query.searchTerm as string) || "";

  if (!month || !year) {
    res
      .status(400)
      .json(createResponse(400, "Missing required query parameters"));
    return;
  }

  try {
    const { commissionPayouts, totalCount } = await getMonthlyCommissionPayouts(
      month,
      year,
      limit,
      offset,
      sortField,
      sortOrder,
      searchTerm
    );

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json(
      createResponse(200, "Commission payouts fetched successfully", {
        commissionPayouts,
        totalCount,
        totalPages,
        currentPage: page,
        limit,
      })
    );
  } catch (error) {
    res
      .status(500)
      .json(createResponse(500, "Error fetching commission payouts", error));
  }
};
