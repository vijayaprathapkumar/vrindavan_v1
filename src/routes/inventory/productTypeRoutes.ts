import express from 'express';
import {
  getProductTypes,
  addProductType,
  getProductTypeById,
  updateProductType,
  deleteProductType
} from '../../controllers/inventory/productTypeController';
import {
  productTypeValidation,
  productTypeIdValidation,
  validate
} from '../../validation/inventory/productTypeValidation';

const router = express.Router();

router.get("/", getProductTypes);
router.post("/", productTypeValidation, validate, addProductType);
router.get("/:id", productTypeIdValidation, validate, getProductTypeById);
router.put("/:id", productTypeIdValidation, productTypeValidation, validate, updateProductType);
router.delete("/:id", productTypeIdValidation, validate, deleteProductType);

export default router;
