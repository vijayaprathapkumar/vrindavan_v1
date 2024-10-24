import express from 'express';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';
import { fetchFeaturedCategories } from '../../controllers/featureProduct/featureProductController';

const router = express.Router();

router.get('/', verifyDeviceToken, fetchFeaturedCategories);

export default router;
