import express from 'express';
import {
  getCategories,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory
} from '../../controllers/inventory/categoryController';
import {
  categoryValidation,
  categoryIdValidation,
  validate
} from '../../validation/inventory/categoryValidation';

const router = express.Router();

// Define routes for categories
router.get('/', getCategories);
router.post('/', categoryValidation, validate, addCategory);
router.get('/:id', categoryIdValidation, validate, getCategory);
router.put('/:id', categoryIdValidation, categoryValidation, validate, updateCategory);
router.delete('/:id', categoryIdValidation, validate, deleteCategory);

export default router;
