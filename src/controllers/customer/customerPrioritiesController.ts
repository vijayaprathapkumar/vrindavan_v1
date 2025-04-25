import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import { updateDeliveryPriority } from "../../models/customer/customerPrioritiesModel";


// Controller to handle the update of delivery_priority
export const updateCustomerPriority = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, deliveryPriority } = req.body;

  if (!userId || !deliveryPriority) {
    return res
      .status(400)
      .json(createResponse(400, "User ID and delivery priority are required."));
  }

  try {
    const result = await updateDeliveryPriority(userId, deliveryPriority);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json(createResponse(404, "User not found or no changes made."));
    }

    return res.status(200).json(createResponse(200, "Delivery priority updated successfully."));
  } catch (error) {
    console.error("Error updating delivery priority:", error);
    return res
      .status(500)
      .json(createResponse(500, "Error updating delivery priority", error.message));
  }
};
