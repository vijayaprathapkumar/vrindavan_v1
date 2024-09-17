import { Router } from 'express';
import { getRouteOrders } from '../../controllers/orders/routeOrdersController';

const router = Router();

router.get('/', getRouteOrders);

export default router;
