"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockSummary = void 0;
const responseHandler_1 = require("../../utils/responseHandler");
const StockModels_1 = require("../../models/inventory/StockModels");
const getStockSummary = async (req, res) => {
    try {
        const stock = await (0, StockModels_1.getStockCounts)();
        return res.status(200).json((0, responseHandler_1.createResponse)(200, "Stock summary fetched successfully", {
            stock: [
                {
                    lowStockCount: stock.lowStockCount || 0,
                    inStockCount: stock.inStockCount || 0,
                    outOfStockCount: stock.outOfStockCount || 0,
                    allStockCount: Number(stock.lowStockCount) +
                        Number(stock.inStockCount) +
                        Number(stock.outOfStockCount) || 0,
                },
            ],
        }));
    }
    catch (error) {
        console.error("Error fetching stock summary:", error);
        return res
            .status(500)
            .json((0, responseHandler_1.createResponse)(500, "Error fetching stock summary", error.message));
    }
};
exports.getStockSummary = getStockSummary;
