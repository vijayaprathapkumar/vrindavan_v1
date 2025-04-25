import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  getStockCounts,
  getFilteredProducts,
} from "../../models/inventory/StockModels";

export const getStockSummary = async (req: Request, res: Response) => {
  try {
    const stock = await getStockCounts();

    return res.status(200).json(
      createResponse(200, "Stock summary fetched successfully", {
        stock: [
          {
            lowStockCount: stock.lowStockCount || 0,
            inStockCount: stock.inStockCount || 0,
            outOfStockCount: stock.outOfStockCount || 0,
            allStockCount:
              Number(stock.lowStockCount) +
                Number(stock.inStockCount) +
                Number(stock.outOfStockCount) || 0,
          },
        ],
      })
    );
  } catch (error) {
    console.error("Error fetching stock summary:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error fetching stock summary", error.message));
  }
};

export const getFilteredStockProducts = async (req: Request, res: Response) => {
  try {
    const { stockType } = req.query;
    if (!stockType || typeof stockType !== "string") {
      return res
        .status(400)
        .json(createResponse(400, "Stock type is required"));
    }

    const products = await getFilteredProducts(stockType);
    return res.status(200).json(
      createResponse(200, "Filtered products fetched successfully", {
        products,
      })
    );
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return res
      .status(500)
      .json(
        createResponse(500, "Error fetching filtered products", error.message)
      );
  }
};
