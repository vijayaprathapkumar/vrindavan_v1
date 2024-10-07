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
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

// Define routes for categories
router.get('/',verifyDeviceToken, getCategories);
router.post('/', verifyDeviceToken,categoryValidation, validate, addCategory);
router.get('/:id',verifyDeviceToken, categoryIdValidation, validate, getCategory);
router.put('/:id', verifyDeviceToken,categoryIdValidation, categoryValidation, validate, updateCategory);
router.delete('/:id',verifyDeviceToken, categoryIdValidation, validate, deleteCategory);

export default router;
