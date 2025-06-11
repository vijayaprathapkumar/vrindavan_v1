import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import { findGuestByUsers } from "../../models/guest/guestModel";

export const getGuestByUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const guestUser = await findGuestByUsers();

    if (!guestUser) {
      res.status(404).json(createResponse(404, "User not found"));
    } else {
      res
        .status(200)
        .json(createResponse(200, "User fetched successfully", { guestUser }));
    }
  } catch (error) {
    res.status(500).json(createResponse(500, "Error fetching user", error));
  }
};
