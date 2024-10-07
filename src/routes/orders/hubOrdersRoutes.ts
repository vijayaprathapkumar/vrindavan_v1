import { Router } from 'express';
import { getHubOrders } from '../../controllers/orders/hubOrdersController';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyDeviceToken,getHubOrders); 

export default router;
