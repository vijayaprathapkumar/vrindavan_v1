import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import { getStockCounts } from "../../models/inventory/StockModels";

export const getStockSummary = async (req: Request, res: Response) => {
  try {
    const stock = await getStockCounts();
console.log('stock',stock);

    return res.status(200).json(
      createResponse(200, "Stock summary fetched successfully", {
        stock: [
          {
            lowStockCount: stock.lowStockCount || 0,
            inStockCount: stock.inStockCount || 0,
            outOfStockCount: stock.outOfStockCount || 0,
          },
        ],
      })
    );
  } catch (error) {
    console.error("Error fetching stock summary:", error);
    return res.status(500).json(
      createResponse(500, "Error fetching stock summary", error.message)
    );
  }
};
