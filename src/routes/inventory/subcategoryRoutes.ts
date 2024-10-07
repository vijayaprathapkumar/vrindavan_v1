import express from 'express';
import {
  getSubCategoriesWithCategory,
  addSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory
} from '../../controllers/inventory/subcategoryController';
import {
  subCategoryValidation,
  subCategoryIdValidation,
  validate
} from '../../validation/inventory/subcategoryValidation';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get("/", verifyDeviceToken,getSubCategoriesWithCategory);

router.post("/", verifyDeviceToken,subCategoryValidation, validate, addSubCategory);

router.get("/:id",verifyDeviceToken, subCategoryIdValidation, validate, getSubCategory);

router.put("/:id",verifyDeviceToken, subCategoryIdValidation, subCategoryValidation, validate, updateSubCategory);

router.delete("/:id",verifyDeviceToken, subCategoryIdValidation, validate, deleteSubCategory);

export default router;
