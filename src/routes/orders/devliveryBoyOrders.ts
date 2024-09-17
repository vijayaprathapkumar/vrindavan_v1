import { Router } from 'express';
import { getDeliveryBoyOrders } from '../../controllers/orders/deliveryBoyOrdersController';

const router = Router();

router.get('/', getDeliveryBoyOrders); 

export default router;
