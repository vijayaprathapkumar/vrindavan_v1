import { Request, Response } from "express";
import { db } from "../../config/databaseConnection";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import dotenv from "dotenv";
import multer from "multer";
import { OkPacket } from "mysql2";

dotenv.config();

// AWS S3 configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Multer configuration to store files in memory
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage }).single("file");

// Media config
export const mediaConfig = {
  "App\\Models\\Category": "category",
  "App\\Models\\SubCategory": "subCategory",
  "App\\Models\\Food": "foods",
  "App\\Models\\Banner": "banners",
  "App\\Models\\UserNotification": "notification",
};

// Image upload controller
export const imageUpload = async (req: Request, res: Response) => {
  try {
    const { model_type } = req.body;
    const file = req.file;
    if (!file || !model_type) {
      return res
        .status(400)
        .json({ message: "Missing required fields: file or model_type" });
    }

    const folderName = mediaConfig[model_type] || "default";
    const fileKey = `${folderName}/${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: "media-image-upload",
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    return res.status(201).json({
      message: "Image uploaded successfully",
      original_url: `https://${"media-image-upload"}.s3.${
        process.env.AWS_REGION
      }.amazonaws.com/${fileKey}`,
      file_name: file.originalname,
      mime_type: file.mimetype,
      size: file.size,
      uuid: uuidv4(),
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to update the media record with a new all ID
export const insertMediaRecord = async (
  model_type: string,
  model_id: number,
  file_name: string,
  mime_type: string,
  size: number
): Promise<void> => {
  const uuid = uuidv4();
  const query = `
      INSERT INTO media (
        model_type, model_id, uuid, collection_name, name, file_name, mime_type, disk, conversions_disk,
        size, manipulations, custom_properties, generated_conversions, responsive_images, order_column,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;

  const params = [
    model_type,
    model_id,
    uuid,
    "image",
    path.parse(file_name).name,
    file_name,
    mime_type,
    "public",
    "public1",
    size,
    "[]",
    JSON.stringify({ uuid, user_id: 1 }),
    JSON.stringify({ icon: true, thumb: true }),
    "[]",
    0,
  ];

  await db.promise().query(query, params);
};

// update image file
export const updateMediaRecord = async (
  media_id: string,
  file_name: string,
  mime_type: string,
  size: number
): Promise<void> => {
  const query = `
     UPDATE media
     SET 
      name = ?,
      file_name = ?, 
      mime_type = ?, 
      size = ?, 
      conversions_disk = ?,
      updated_at = NOW()
     WHERE id = ?
  `;

  const params = [
    path.parse(file_name).name,
    file_name,
    mime_type,
    size,
    "public1",
    media_id,
  ];

  try {
    const [result] = await db.promise().query<OkPacket>(query, params);

    if (result.affectedRows === 0) {
      throw new Error("No record found to update.");
    }
    console.log("Media record updated successfully.");
  } catch (error) {
    console.error("Error in updateMediaRecord:", error);
    throw error;
  }
};
