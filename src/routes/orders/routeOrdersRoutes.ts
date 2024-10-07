import { Router } from 'express';
import { getRouteOrders } from '../../controllers/orders/routeOrdersController';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/', verifyDeviceToken,getRouteOrders);

export default router;
