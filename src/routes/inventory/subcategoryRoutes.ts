import express from 'express';
import {
  getSubcategories,
  addSubcategory,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory
} from '../../controllers/inventory/subcategoryController';
import {
  subcategoryValidation,
  subcategoryIdValidation,
  validate
} from '../../validation/inventory/subcategoryValidation';

const router = express.Router();

router.get("/", getSubcategories);

router.post("/", subcategoryValidation, validate, addSubcategory);

router.get("/:id", subcategoryIdValidation, validate, getSubcategoryById);

router.put("/:id", subcategoryIdValidation, subcategoryValidation, validate, updateSubcategory);

router.delete("/:id", subcategoryIdValidation, validate, deleteSubcategory);

export default router;
