import express from 'express';
import {
  getSubCategories,
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

const router = express.Router();

router.get("/", getSubCategories);
router.post("/", subCategoryValidation, validate, addSubCategory);
router.get("/:id", subCategoryIdValidation, validate, getSubCategory);
router.put("/:id", subCategoryIdValidation, subCategoryValidation, validate, updateSubCategory);
router.delete("/:id", subCategoryIdValidation, validate, deleteSubCategory);

export default router;
