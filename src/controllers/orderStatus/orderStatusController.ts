import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";

export const checkOrderStatus = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const cutoffTime = new Date();
    cutoffTime.setHours(21, 30, 0, 0);

    if (now < cutoffTime) {
      // Before 9:30 PM: Orders can be generated
      return res.status(200).json(
        createResponse(200, "Orders can still be generated for tomorrow.", {
          message: "Orders can still be generated.",
          status: 1,
        })
      );
    } else {
      // After 9:30 PM: Orders cannot be generated
      return res.status(400).json(
        createResponse(400, "Order generation for tomorrow is closed.", {
          message: "Order generation for tomorrow is closed.",
          status: 0,
        })
      );
    }
  } catch (error) {
    console.error("Error checking order status:", error);
    return res
      .status(500)
      .json(createResponse(500, "Failed to retrieve order status"));
  }
};
