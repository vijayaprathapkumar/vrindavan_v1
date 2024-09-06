import express from 'express';
import { getProductById, addProduct, getProducts } from '../controllers/productController';

const router = express.Router();

router.post('/', addProduct);
router.get('/', getProducts);
router.get("/:id", getProductById);

export default router;
