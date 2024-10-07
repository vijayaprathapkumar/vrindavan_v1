import express from 'express';
import {
  getProductBrands,
  addProductBrand,
  updateProductBrand,
  deleteProductBrand,
  getProductBrandById
} from '../../controllers/inventory/productBrandController';
import {
  brandValidation,
  brandIdValidation,
  validate
} from '../../validation/inventory/productBrandValidation';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

// Define routes for product brands
router.get("/",verifyDeviceToken, getProductBrands);
router.post("/",verifyDeviceToken, brandValidation, validate, addProductBrand);
router.get("/:id",verifyDeviceToken, brandIdValidation, validate, getProductBrandById);
router.put("/:id",verifyDeviceToken, brandIdValidation, brandValidation, validate, updateProductBrand);
router.delete("/:id",verifyDeviceToken, brandIdValidation, validate, deleteProductBrand);

export default router;
