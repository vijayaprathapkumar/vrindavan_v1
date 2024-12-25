import express from 'express';
import { imageUpload, uploadMiddleware } from '../../controllers/imageUpload/imageUploadController';

const router = express.Router();

router.post('/', uploadMiddleware, imageUpload);

export default router;
