import express from 'express';
import {
  getCategories,
  addCategory,
  getCategory,
  updateCategory,
  deleteCategory
} from '../../controllers/inventory/categoryController';
import { verifyDeviceToken } from '../../middlewares/authMiddleware';

const router = express.Router();

// Define routes for categories
router.get('/',verifyDeviceToken, getCategories);
router.post('/', verifyDeviceToken, addCategory);
router.get('/:id',verifyDeviceToken, getCategory);
router.put('/:id', verifyDeviceToken, updateCategory);
router.delete('/:id',verifyDeviceToken, deleteCategory);

export default router;
