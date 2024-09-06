import express from 'express';
import { getProductBrands, addProductBrand } from '../controllers/productBrandController';

const router = express.Router();

// Route to fetch all product brands
router.get('/', getProductBrands);

// Route to add a new product brand
router.post('/', addProductBrand);

export default router;
