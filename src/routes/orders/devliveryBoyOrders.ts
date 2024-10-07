import { Router } from 'express';
import { getDeliveryBoyOrders } from '../../controllers/orders/deliveryBoyOrdersController';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/',verifyDeviceToken, getDeliveryBoyOrders); 

export default router;
