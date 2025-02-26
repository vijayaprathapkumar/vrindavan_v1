import { Request, Response } from "express";
import { createResponse } from "../../utils/responseHandler";
import {
  adminVerify,
  updateApiToken,
} from "../../models/adminLogin/loginModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validateEmailRegex, validatePassword } from "../../config/regex/regex";

dotenv.config();

// verify admin login
export const adminVerifyController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(createResponse(400, "Email and password are required"));
  }

  if (!validateEmailRegex(email)) {
    return res.status(400).json(createResponse(400, "Invalid email format"));
  }

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json(createResponse(400, "Password must not be empty"));
  }

  try {
    const userRecord = await adminVerify(email, password);

    if (!userRecord) {
      return res.status(401).json(createResponse(401, "Invalid credentials"));
    }

    let apiToken = userRecord.device_token;

    if (!apiToken) {
      apiToken = generateApiToken(userRecord.id, userRecord.email);
      await updateApiToken(userRecord.id, apiToken);
    }

    return res.status(200).json(
      createResponse(200, "Login successful", {
        user: userRecord,
      })
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse(500, "Internal server error"));
  }
};

const generateApiToken = (userId: number, email: string) => {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: "1h",
  });
};
