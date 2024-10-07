import { Router } from 'express';
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder } from '../../controllers/orders/orderController';
import { orderValidation, orderIdValidation, validate } from '../../validation/orders/ordersValidation';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = Router();

router.get('/',verifyDeviceToken, getOrders);

router.get('/:id',verifyDeviceToken, orderIdValidation, validate, getOrder);

router.post('/',verifyDeviceToken, orderValidation, validate, createOrder);

router.put('/:id',verifyDeviceToken, orderIdValidation, orderValidation, validate, updateOrder);

router.delete('/:id', verifyDeviceToken,orderIdValidation, validate, deleteOrder);

export default router;
