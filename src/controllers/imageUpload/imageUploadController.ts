import { Request, Response } from "express";
import { db } from "../../config/databaseConnection";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import AWS from "aws-sdk";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

// AWS S3 configuration
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Multer configuration to store files in memory
const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage }).single("file");

// Media config
export const mediaConfig = {
  AppModelsCategory: "category",
  AppModelsSubCategory: "subCategory",
  AppModelsFood: "foods",
  AppModelsBanner: "banners",
  AppModelsNotification: "notification",
};

// Image upload controller
export const imageUpload = async (
  req: Request,
  res: Response
): Promise<Response<any>> => {
  try {
    const { model_type, model_id } = req.body;
    const file = req.file;

    if (!file || !model_type) {
      return res
        .status(400)
        .json({ message: "Missing required fields: file or model_type" });
    }

    const uuid = uuidv4();
    const folderName = mediaConfig[model_type] || "default";
    const fileKey = `${folderName}/${file.originalname}`;

    // Upload file to S3
    const uploadPromise = s3
      .upload({
        Bucket: "imagefileupload-1",
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
      .promise();

    const uploadResult = await uploadPromise;

    let mediaId;

    if (model_id) {
      const updateQuery = `
        UPDATE media 
        SET 
          uuid = ?, 
          file_name = ?, 
          mime_type = ?, 
          size = ?, 
          updated_at = NOW()
        WHERE id = ?`;

      const [updateResult]: any = await db
        .promise()
        .query(updateQuery, [
          uuid,
          file.originalname,
          file.mimetype,
          file.size,
          model_id,
          model_type,
        ]);

      mediaId = updateResult.affectedRows ? model_id : null;
    }

    // If model_id is not provided, insert a new media record
    if (!mediaId) {
      const insertQuery = `
        INSERT INTO media (
          model_type, model_id, uuid, collection_name, name, file_name, mime_type, disk, conversions_disk,
          size, manipulations, custom_properties, generated_conversions, responsive_images, order_column,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

      const [insertResult]: any = await db
        .promise()
        .query(insertQuery, [
          model_type,
          model_id || 0,
          uuid,
          "image",
          path.parse(file.originalname).name,
          file.originalname,
          file.mimetype,
          "public",
          "public",
          file.size,
          "[]",
          JSON.stringify({ uuid, user_id: 1 }),
          JSON.stringify({ icon: true, thumb: true }),
          "[]",
          0,
        ]);

      mediaId = insertResult.insertId;
    }

    return res.status(201).json({
      message: "Image uploaded and processed successfully",
      mediaId,
      original_url: uploadResult.Location,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to update the media record with a new all ID
export const updateMediaModelId = async (
  mediaId: number,
  modifyId: number
): Promise<void> => {
  try {
    const updateQuery = `
            UPDATE media 
            SET model_id = ? 
            WHERE id = ?
        `;

    const [result]: any = await db
      .promise()
      .query(updateQuery, [modifyId, mediaId]);

  } catch (error) {
    console.error("Error updating media category ID:", error);
    throw new Error("Internal server error");
  }
};
