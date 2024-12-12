import express from 'express';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';
import { addFeaturedCategory, fetchFeaturedCategories } from '../../controllers/featureProduct/featureProductController';

const router = express.Router();

router.get('/', verifyDeviceToken, fetchFeaturedCategories);
router.post('/', verifyDeviceToken, addFeaturedCategory);

export default router;
