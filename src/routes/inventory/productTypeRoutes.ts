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
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get("/",verifyDeviceToken, getProductTypes);
router.post("/",verifyDeviceToken, productTypeValidation, validate, addProductType);
router.get("/:id",verifyDeviceToken, productTypeIdValidation, validate, getProductTypeById);
router.put("/:id",verifyDeviceToken, productTypeIdValidation, productTypeValidation, validate, updateProductType);
router.delete("/:id",verifyDeviceToken, productTypeIdValidation, validate, deleteProductType);

export default router;
