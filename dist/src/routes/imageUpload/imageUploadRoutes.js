"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const imageUploadController_1 = require("../../controllers/imageUpload/imageUploadController");
const router = express_1.default.Router();
router.post('/', imageUploadController_1.uploadMiddleware, imageUploadController_1.imageUpload);
exports.default = router;
