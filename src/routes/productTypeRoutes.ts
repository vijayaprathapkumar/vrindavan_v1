import express from 'express';
import { getProductTypes, addProductType } from '../controllers/productTypeController';

const router = express.Router();

// Route to fetch all product types
router.get('/', getProductTypes);

// Route to add a new product type
router.post('/', addProductType);

export default router;
