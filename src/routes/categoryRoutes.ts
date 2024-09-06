import express from 'express';
import { getCategories, addCategory, getCategory } from '../controllers/categoryController';

const router = express.Router();

// Route to fetch all categories
router.get('/', getCategories);

// Route to add a new category
router.post('/', addCategory);

// Route to get category by ID
router.get('/:id', getCategory);

export default router;
