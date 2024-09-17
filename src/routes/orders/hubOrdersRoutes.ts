import { Router } from 'express';
import { getHubOrders } from '../../controllers/orders/hubOrdersController';

const router = Router();

router.get('/', getHubOrders); 

export default router;
