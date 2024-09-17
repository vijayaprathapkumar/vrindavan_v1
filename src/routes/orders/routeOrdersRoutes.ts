import { Router } from 'express';
import { getOrders, getOrder, createOrder, updateOrder, deleteOrder } from '../../controllers/orders/routeOrdersController';
import { orderValidation, orderIdValidation, validate } from '../../validation/orders/routeOrdersVaildation';

const router = Router();

router.get('/', getOrders);

router.get('/:id', orderIdValidation, validate, getOrder);

router.post('/', orderValidation, validate, createOrder);

router.put('/:id', orderIdValidation, orderValidation, validate, updateOrder);

router.delete('/:id', orderIdValidation, validate, deleteOrder);

export default router;
