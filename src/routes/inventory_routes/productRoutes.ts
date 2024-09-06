// src/routes/productRoutes.ts
import express from 'express';
import {
  getProductById,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct
} from '../../controllers/inventory_controllers/productController';
import {
  productValidation,
  productIdValidation,
  validate
} from '../../validation/inventory/productValidation';

const router = express.Router();

router.post("/", productValidation, validate, addProduct);
router.get("/", getProducts);
router.get("/:id", productIdValidation, validate, getProductById);
router.put("/:id", productIdValidation, productValidation, validate, updateProduct);
router.delete("/:id", productIdValidation, validate, deleteProduct);

export default router;
