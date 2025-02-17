
import { Request, Response } from "express";
import { getStockSummaryModel } from "../../models/inventory/StockModels";

export const getStockCount = async (req: Request, res: Response) => {
    try {
      const stockData = await getStockSummaryModel();
  
      return res.status(200).json({
        statusCode: 200,
        message: "Stock count fetched successfully",
        data: stockData,
      });
    } catch (error) {
      console.error("Error fetching stock count:", error);
      return res.status(500).json({
        statusCode: 500,
        message: "Error fetching stock count",
        error: error.message,
      });
    }
  };