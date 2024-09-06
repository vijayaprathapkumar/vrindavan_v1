
import express from 'express';
import {
  getProductBrands,
  addProductBrand,
  updateProductBrand,
  deleteProductBrand,
  getProductBrandById
} from '../../controllers/inventory_controllers/productBrandController';
import {
  brandValidation,
  brandIdValidation,
  validate
} from '../../validation/inventory/productBrandValidation';

const router = express.Router();


router.get("/", getProductBrands);

router.post("/", brandValidation, validate, addProductBrand);

router.get("/:id", brandIdValidation, validate, getProductBrandById);

router.put("/:id", brandIdValidation, brandValidation, validate, updateProductBrand);

router.delete("/:id", brandIdValidation, validate, deleteProductBrand);

export default router;
