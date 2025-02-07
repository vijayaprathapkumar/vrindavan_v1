"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMediaRecord = exports.insertMediaRecord = exports.imageUpload = exports.mediaConfig = exports.uploadMiddleware = void 0;
const databaseConnection_1 = require("../../config/databaseConnection");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
dotenv_1.default.config();
// AWS S3 configuration
const s3 = new aws_sdk_1.default.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
// Multer configuration to store files in memory
const storage = multer_1.default.memoryStorage();
exports.uploadMiddleware = (0, multer_1.default)({ storage }).single("file");
// Media config
exports.mediaConfig = {
    "App\\Models\\Category": "category",
    "App\\Models\\SubCategory": "subCategory",
    "App\\Models\\Food": "foods",
    "App\\Models\\Banner": "banners",
    "App\\Models\\UserNotification": "notification",
};
// Image upload controller
const imageUpload = async (req, res) => {
    try {
        const { model_type } = req.body;
        const file = req.file;
        if (!file || !model_type) {
            return res
                .status(400)
                .json({ message: "Missing required fields: file or model_type" });
        }
        const folderName = exports.mediaConfig[model_type] || "default";
        const fileKey = `${folderName}/${file.originalname}`;
        // Upload file to S3
        const uploadPromise = s3
            .upload({
            Bucket: "media-image-upload",
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
            .promise();
        const uploadResult = await uploadPromise;
        return res.status(201).json({
            message: "Image uploaded successfully",
            original_url: uploadResult.Location,
            file_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            uuid: (0, uuid_1.v4)(),
        });
    }
    catch (error) {
        console.error("Error uploading image:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.imageUpload = imageUpload;
// Function to update the media record with a new all ID
const insertMediaRecord = async (model_type, model_id, file_name, mime_type, size) => {
    const uuid = (0, uuid_1.v4)();
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
        path_1.default.parse(file_name).name,
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
    await databaseConnection_1.db.promise().query(query, params);
};
exports.insertMediaRecord = insertMediaRecord;
// update image file
const updateMediaRecord = async (media_id, file_name, mime_type, size) => {
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
    const params = [path_1.default.parse(file_name).name, file_name, mime_type, size, "public1", media_id];
    try {
        const [result] = await databaseConnection_1.db.promise().query(query, params);
        if (result.affectedRows === 0) {
            throw new Error("No record found to update.");
        }
        console.log("Media record updated successfully.");
    }
    catch (error) {
        console.error("Error in updateMediaRecord:", error);
        throw error;
    }
};
exports.updateMediaRecord = updateMediaRecord;
